-- Migration to remove the foreign key constraint to admin_users table
-- from the seller_verifications table

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

-- Update RLS policies to remove any dependencies on admin_users
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

-- Note that we're keeping the verified_by column for now, but it's no longer constrained
-- to reference admin_users. This avoids breaking existing code that might reference this column.