-- Add coverage limits to profiles table for general, non-project-specific COI uploads
ALTER TABLE profiles 
ADD COLUMN gl_limit INTEGER,
ADD COLUMN auto_limit INTEGER,
ADD COLUMN wc_limit INTEGER,
ADD COLUMN umbrella_limit INTEGER,
ADD COLUMN has_additional_insured BOOLEAN,
ADD COLUMN expiry_date TEXT;
