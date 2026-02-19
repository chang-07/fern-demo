-- Add requirements column to projects table
ALTER TABLE projects ADD COLUMN requirements JSONB DEFAULT '{"gl": {"occurrence": 1000000, "aggregate": 2000000}, "wc": {"statutory": true}, "auto": {"combined": 1000000}}';
