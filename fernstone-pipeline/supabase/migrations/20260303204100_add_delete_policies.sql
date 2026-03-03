-- Add RLS policy allowing GCs to delete their own job postings
CREATE POLICY "GCs can delete their own job postings"
    ON job_postings FOR DELETE
    USING (gc_id = auth.uid());

-- Add RLS policy allowing GCs to delete their own projects
CREATE POLICY "GCs can delete their own projects"
    ON projects FOR DELETE
    USING (gc_id = auth.uid());
