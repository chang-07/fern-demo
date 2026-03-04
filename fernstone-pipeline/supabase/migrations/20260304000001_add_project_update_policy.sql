-- Add UPDATE policy for projects so GCs can change the status
CREATE POLICY "GC can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = gc_id);
