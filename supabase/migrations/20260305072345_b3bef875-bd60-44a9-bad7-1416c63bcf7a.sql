
-- Allow all authenticated workers to view ALL assessments
CREATE POLICY "Workers can view all assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'worker'::app_role));

-- Drop the old restrictive policy for workers
DROP POLICY IF EXISTS "Workers can view assigned assessments" ON public.assessments;

-- Allow workers to self-create assignments (to start any assessment)
CREATE POLICY "Workers can self-assign"
ON public.assessment_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'worker'::app_role)
  AND worker_id = auth.uid()
  AND assigned_by = auth.uid()
);
