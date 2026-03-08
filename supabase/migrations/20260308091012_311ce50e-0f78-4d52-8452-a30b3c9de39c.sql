CREATE POLICY "Clients can update evaluations for own assessments"
ON public.evaluations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM assessment_assignments aa
    JOIN assessments a ON a.id = aa.assessment_id
    WHERE aa.id = evaluations.assignment_id
      AND a.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM assessment_assignments aa
    JOIN assessments a ON a.id = aa.assessment_id
    WHERE aa.id = evaluations.assignment_id
      AND a.created_by = auth.uid()
  )
);