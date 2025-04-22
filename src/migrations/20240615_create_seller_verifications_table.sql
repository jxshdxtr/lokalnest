-- Create seller_verifications table
CREATE TABLE IF NOT EXISTS seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  document_type VARCHAR(100) NOT NULL DEFAULT 'DTI Certificate',
  certification_number VARCHAR(100) NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  document_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_verified column to seller_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'seller_profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_seller_verifications_seller_id ON seller_verifications(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_verifications_status ON seller_verifications(status);

-- Create RLS policy
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own verification data
CREATE POLICY seller_verification_select_policy ON seller_verifications 
  FOR SELECT USING (auth.uid() = seller_id);

-- Sellers can insert their own verification data
CREATE POLICY seller_verification_insert_policy ON seller_verifications 
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Only admins can update verification status
CREATE POLICY seller_verification_update_policy ON seller_verifications 
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_seller_verifications_updated_at ON seller_verifications;
CREATE TRIGGER trigger_seller_verifications_updated_at
  BEFORE UPDATE ON seller_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp(); 