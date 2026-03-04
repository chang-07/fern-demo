-- Add UPDATE policy for subcontractors so GCs can approve them
CREATE POLICY "GC can update project subcontractors" ON subcontractors
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE gc_id = auth.uid()
        )
    );
