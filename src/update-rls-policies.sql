-- Minimal script to update RLS policies without table recreation
-- This only updates the policies to remove admin_users references

-- Update the Row Level Security policies to not reference admin_users
DO $$ 
BEGIN
  -- Drop existing policies that reference admin_users
  DROP POLICY IF EXISTS seller_verification_update_policy ON seller_verifications;
  
  -- Create new policies that use profiles table instead
  CREATE POLICY seller_verification_update_policy ON seller_verifications 
    FOR UPDATE USING (
      -- Allow updates by the seller themselves or anyone with admin role
      (auth.uid() = seller_id) OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  
  -- Make sure select policy also doesn't reference admin_users
  DROP POLICY IF EXISTS seller_verification_select_policy ON seller_verifications;
  CREATE POLICY seller_verification_select_policy ON seller_verifications 
    FOR SELECT USING (
      -- Allow reads by seller themselves or admin
      auth.uid() = seller_id OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
  -- Ensure insert policy is also defined correctly
  DROP POLICY IF EXISTS seller_verification_insert_policy ON seller_verifications;
  CREATE POLICY seller_verification_insert_policy ON seller_verifications 
    FOR INSERT WITH CHECK (
      auth.uid() = seller_id
    );
END $$;