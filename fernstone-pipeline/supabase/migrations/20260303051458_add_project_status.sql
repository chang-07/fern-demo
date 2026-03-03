-- Add Status to Projects
ALTER TABLE projects
  ADD COLUMN status TEXT DEFAULT 'OPEN'; -- OPEN, CLOSED
