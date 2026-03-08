CREATE POLICY "Clients can view assignments for own assessments"
ON public.assessment_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_assignments.assessment_id
    AND a.created_by = auth.uid()
  )
);