
CREATE POLICY "Workers can update own assignment status"
ON public.assessment_assignments
FOR UPDATE
TO authenticated
USING (worker_id = auth.uid())
WITH CHECK (worker_id = auth.uid());
