-- Create a completely fresh seller_verifications table without any admin_users references

-- First, backup the current data if there's any
CREATE TABLE IF NOT EXISTS seller_verifications_backup AS
SELECT * FROM seller_verifications;

-- Drop the existing table and its constraints
DROP TABLE IF EXISTS seller_verifications CASCADE;

-- Recreate the table with the proper structure
CREATE TABLE seller_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_number TEXT NULL,
  document_expiry_date DATE NULL,
  government_id_type TEXT NULL,
  government_id_url TEXT NULL,
  seller_type TEXT NULL,
  first_name TEXT NULL,
  middle_name TEXT NULL,
  last_name TEXT NULL,
  suffix TEXT NULL,
  business_name TEXT NULL,
  registered_address TEXT NULL,
  zip_code TEXT NULL,
  tin_number TEXT NULL,
  vat_status TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  verified_by UUID NULL REFERENCES profiles(id),
  verification_date TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_seller_verifications_seller_id ON seller_verifications(seller_id);
CREATE INDEX idx_seller_verifications_status ON seller_verifications(status);
CREATE INDEX idx_seller_verifications_verified_by ON seller_verifications(verified_by);

-- Add comments to columns
COMMENT ON COLUMN seller_verifications.verified_by IS 'ID of admin user who verified the seller (FK to profiles.id where role = admin)';

-- Set up RLS policies for the table
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;

-- Script to clean up seller_verifications table policies
-- Specifically removing any admin_users references in RLS policies

-- Drop and recreate the RLS policies without admin_users references
DO $$ 
BEGIN
  -- First drop existing policies that might reference admin_users
  DROP POLICY IF EXISTS seller_verification_update_policy ON seller_verifications;
  
  -- Create new policy for update operations that uses profiles table instead
  CREATE POLICY seller_verification_update_policy ON seller_verifications 
    FOR UPDATE USING (
      -- Allow updates by the seller themselves or anyone with admin role
      (auth.uid() = seller_id) OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  
  -- Ensure the select policy is also properly configured
  DROP POLICY IF EXISTS seller_verification_select_policy ON seller_verifications;
  CREATE POLICY seller_verification_select_policy ON seller_verifications 
    FOR SELECT USING (
      -- Allow reads by the seller themselves or anyone with admin role
      auth.uid() = seller_id OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
END $$;

-- Only seller can insert their own verification data
CREATE POLICY seller_verification_insert_policy ON seller_verifications 
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id
  );

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seller_verifications_timestamp 
  BEFORE UPDATE ON seller_verifications
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Restore data from backup with explicit column mapping and type casting
-- Only attempt to restore if the backup table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_verifications_backup') THEN
    INSERT INTO seller_verifications (
      id, 
      seller_id, 
      document_type, 
      document_url, 
      document_number, 
      document_expiry_date, 
      government_id_type, 
      government_id_url, 
      seller_type,
      first_name,
      middle_name,
      last_name,
      suffix,
      business_name,
      registered_address,
      zip_code,
      tin_number,
      vat_status,
      status,
      notes,
      verified_by,
      verification_date,
      created_at,
      updated_at
    )
    SELECT 
      id, 
      seller_id, 
      document_type, 
      document_url, 
      certification_number, -- Map to document_number
      expiry_date, -- Map to document_expiry_date
      government_id_type,
      government_id_url,
      seller_type,
      first_name,
      middle_name,
      last_name,
      suffix,
      business_name,
      registered_address,
      zip_code,
      tin_number,
      vat_status,
      status,
      notes,
      verified_by::UUID, -- Explicit UUID casting
      verification_date,
      created_at,
      updated_at
    FROM seller_verifications_backup;
  END IF;
END $$;

-- Drop the backup table if it exists
DROP TABLE IF EXISTS seller_verifications_backup;