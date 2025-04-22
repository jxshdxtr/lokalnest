-- Migration to update seller_verifications table after removing admin_users

-- First, drop the foreign key constraint if it exists
DO $$ 
BEGIN
  -- Check if the constraint exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'seller_verifications_verified_by_fkey' 
    AND table_name = 'seller_verifications'
  ) THEN
    -- Drop the constraint
    ALTER TABLE seller_verifications DROP CONSTRAINT seller_verifications_verified_by_fkey;
  END IF;
END $$;

-- Update RLS policies to remove any dependencies on admin_users table
DROP POLICY IF EXISTS seller_verification_update_policy ON seller_verifications;

-- Create a new update policy that doesn't depend on admin_users
CREATE POLICY seller_verification_update_policy ON seller_verifications 
  FOR UPDATE USING (
    -- Only seller can update their own records or users with admin role
    (auth.uid() = seller_id) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add a foreign key from seller_verifications.verified_by to profiles.id
DO $$ 
BEGIN
  -- Only add the constraint if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'seller_verifications_verified_by_profiles_fkey' 
    AND table_name = 'seller_verifications'
  ) THEN
    -- Add the new foreign key constraint
    ALTER TABLE seller_verifications 
    ADD CONSTRAINT seller_verifications_verified_by_profiles_fkey 
    FOREIGN KEY (verified_by) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- Update column comment to reflect the new relationship
COMMENT ON COLUMN seller_verifications.verified_by IS 'ID of admin user who verified the seller (FK to profiles.id where role = admin)';
