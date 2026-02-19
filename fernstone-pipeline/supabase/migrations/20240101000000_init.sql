-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects defined by the GC
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gc_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  req_gl_occurrence INT DEFAULT 2000000,
  req_additional_insured BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcontractors invited to projects
CREATE TABLE subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'INVITED', -- INVITED, UPLOADED, COMPLIANT, NON_COMPLIANT
  magic_link_token UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Extraction results
CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_id UUID REFERENCES subcontractors(id) ON DELETE CASCADE NOT NULL,
  extracted_gl_limit INT,
  has_additional_insured BOOLEAN,
  expiry_date DATE,
  raw_ai_output JSONB,
  is_compliant BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

-- Policies for Projects
-- GC can view and insert their own projects
CREATE POLICY "GC can view own projects" ON projects
  FOR SELECT USING (auth.uid() = gc_id);

CREATE POLICY "GC can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = gc_id);

-- Policies for Subcontractors
-- GC can view subcontractors for their projects
CREATE POLICY "GC can view project subcontractors" ON subcontractors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = subcontractors.project_id
      AND projects.gc_id = auth.uid()
    )
  );

CREATE POLICY "GC can insert subcontractors" ON subcontractors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = subcontractors.project_id
      AND projects.gc_id = auth.uid()
    )
  );

-- Allow public access via magic link token (via service role or special function in practice, 
-- but for client-side fetching we might need a public policy if the token matches)
-- For now, we'll assume the verification page uses a secure API route or the token acts as a key in a precision RPC/Query.
-- Adding a basic public read policy if the token matches is tricky in pure RLS without a function wrapper.
-- We will rely on server-side fetching with SERVICE_ROLE key for the verification page to keep it secure.

-- Policies for Compliance Reports
-- GC can view reports for their subcontractors
CREATE POLICY "GC can view compliance reports" ON compliance_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subcontractors
      JOIN projects ON projects.id = subcontractors.project_id
      WHERE subcontractors.id = compliance_reports.sub_id
      AND projects.gc_id = auth.uid()
    )
  );
