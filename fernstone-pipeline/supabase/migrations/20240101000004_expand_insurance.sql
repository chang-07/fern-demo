-- Expand projects table for new required limits
ALTER TABLE projects
  ADD COLUMN req_auto_limit INT DEFAULT NULL,
  ADD COLUMN req_wc_limit INT DEFAULT NULL,
  ADD COLUMN req_umbrella_limit INT DEFAULT NULL;

-- Expand compliance_reports table for new extracted values
ALTER TABLE compliance_reports
  ADD COLUMN extracted_auto_limit INT DEFAULT NULL,
  ADD COLUMN has_any_auto BOOLEAN DEFAULT NULL,
  ADD COLUMN extracted_wc_limit INT DEFAULT NULL,
  ADD COLUMN wc_statutory_limits BOOLEAN DEFAULT NULL,
  ADD COLUMN extracted_umbrella_limit INT DEFAULT NULL;
