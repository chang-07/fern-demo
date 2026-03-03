-- Create the job_postings table
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gc_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    industry_focus TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read open postings
CREATE POLICY "Anyone can view open job postings"
    ON job_postings FOR SELECT
    TO authenticated
    USING (status = 'OPEN');

-- Policy: GCs can view all their own postings (even closed ones)
CREATE POLICY "GCs can view their own postings"
    ON job_postings FOR SELECT
    TO authenticated
    USING (auth.uid() = gc_id);

-- Policy: GCs can insert their own postings
CREATE POLICY "GCs can insert their own postings"
    ON job_postings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = gc_id);

-- Policy: GCs can update their own postings
CREATE POLICY "GCs can update their own postings"
    ON job_postings FOR UPDATE
    TO authenticated
    USING (auth.uid() = gc_id);

-- Realtime
alter publication supabase_realtime add table job_postings;
