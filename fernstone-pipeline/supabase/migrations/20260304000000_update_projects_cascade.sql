-- To fix the missing ON DELETE CASCADE for the projects table referencing auth.users
-- This ensures that if a General Contractor deletes their account, their projects are also deleted.

ALTER TABLE projects
DROP CONSTRAINT projects_gc_id_fkey;

ALTER TABLE projects
ADD CONSTRAINT projects_gc_id_fkey
FOREIGN KEY (gc_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
