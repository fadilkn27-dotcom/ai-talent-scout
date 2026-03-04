
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('client', 'worker', 'hr');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Assessments table (created by clients)
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  questions_count INT NOT NULL DEFAULT 0,
  coding_questions TEXT[] DEFAULT '{}',
  algorithm_problems TEXT[] DEFAULT '{}',
  mcqs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Assessment assignments (links assessments to workers)
CREATE TABLE public.assessment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, worker_id)
);
ALTER TABLE public.assessment_assignments ENABLE ROW LEVEL SECURITY;

-- Evaluations table (AI evaluation results)
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assessment_assignments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  syntax_score INT NOT NULL DEFAULT 0,
  logic_score INT NOT NULL DEFAULT 0,
  complexity_score INT NOT NULL DEFAULT 0,
  performance_score INT NOT NULL DEFAULT 0,
  overall_score INT NOT NULL DEFAULT 0,
  recommendation TEXT NOT NULL DEFAULT 'Hold' CHECK (recommendation IN ('Selected', 'Rejected', 'Hold')),
  feedback TEXT[] DEFAULT '{}',
  code_submitted TEXT DEFAULT '',
  language TEXT DEFAULT 'python',
  status TEXT NOT NULL DEFAULT 'review' CHECK (status IN ('selected', 'review', 'rejected')),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-assign role on signup (from user metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker')::app_role;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RLS POLICIES ============

-- Profiles: users can read all profiles, update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- User roles: users can read own role, HR can read all
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "HR can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'hr'));

-- Assessments: clients create/update/delete own, HR reads all, workers read assigned
CREATE POLICY "Clients can create assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'client') AND created_by = auth.uid());
CREATE POLICY "Clients can view own assessments" ON public.assessments FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "HR can view all assessments" ON public.assessments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'hr'));
CREATE POLICY "Workers can view assigned assessments" ON public.assessments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assessment_assignments WHERE assessment_id = assessments.id AND worker_id = auth.uid())
);
CREATE POLICY "Clients can update own assessments" ON public.assessments FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Clients can delete own assessments" ON public.assessments FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Assignment policies
CREATE POLICY "Clients can create assignments" ON public.assessment_assignments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'client') AND assigned_by = auth.uid());
CREATE POLICY "Users can view relevant assignments" ON public.assessment_assignments FOR SELECT TO authenticated USING (assigned_by = auth.uid() OR worker_id = auth.uid());
CREATE POLICY "HR can view all assignments" ON public.assessment_assignments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'hr'));

-- Evaluations policies
CREATE POLICY "Workers can create own evaluations" ON public.evaluations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'worker') AND worker_id = auth.uid());
CREATE POLICY "Workers can view own evaluations" ON public.evaluations FOR SELECT TO authenticated USING (worker_id = auth.uid());
CREATE POLICY "HR can view all evaluations" ON public.evaluations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'hr'));
CREATE POLICY "Clients can view evaluations for own assessments" ON public.evaluations FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.assessment_assignments aa 
    JOIN public.assessments a ON a.id = aa.assessment_id 
    WHERE aa.id = evaluations.assignment_id AND a.created_by = auth.uid()
  )
);
CREATE POLICY "HR can update evaluation status" ON public.evaluations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'hr'));
