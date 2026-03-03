-- Add Company Profile Fields to Subcontractors
ALTER TABLE subcontractors
  ADD COLUMN company_name TEXT,
  ADD COLUMN description TEXT,
  ADD COLUMN industry TEXT;
