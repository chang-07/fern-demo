-- Add INSERT policy for compliance_reports so GCs can seed data
CREATE POLICY "GC can insert compliance reports" ON compliance_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM subcontractors
      JOIN projects ON projects.id = subcontractors.project_id
      WHERE subcontractors.id = compliance_reports.sub_id
      AND projects.gc_id = auth.uid()
    )
  );
