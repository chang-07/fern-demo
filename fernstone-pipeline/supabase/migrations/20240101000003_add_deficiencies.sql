-- Add deficiencies column to compliance_reports table
ALTER TABLE compliance_reports ADD COLUMN deficiencies JSONB DEFAULT '[]';
