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
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Keep the verified_by column but remove any constraints
-- This prevents breaking existing code that might reference this column
COMMENT ON COLUMN seller_verifications.verified_by IS 'ID of user who verified the seller (no longer FK constrained)'; 