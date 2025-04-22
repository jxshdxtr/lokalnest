-- Comprehensive script to fix all admin_users references

-- 1. Update the seller_verifications table
-- Remove foreign key if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'seller_verifications_verified_by_fkey' 
    AND table_name = 'seller_verifications'
  ) THEN
    ALTER TABLE seller_verifications DROP CONSTRAINT seller_verifications_verified_by_fkey;
  END IF;
END $$;

-- Add new foreign key to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'seller_verifications_verified_by_profiles_fkey' 
    AND table_name = 'seller_verifications'
  ) THEN
    ALTER TABLE seller_verifications 
    ADD CONSTRAINT seller_verifications_verified_by_profiles_fkey 
    FOREIGN KEY (verified_by) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- 2. Update the product_flags table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_flags_reviewed_by_fkey' 
    AND table_name = 'product_flags'
  ) THEN
    ALTER TABLE product_flags DROP CONSTRAINT product_flags_reviewed_by_fkey;
  END IF;
END $$;

-- Add new foreign key to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_flags_reviewed_by_profiles_fkey' 
    AND table_name = 'product_flags'
  ) THEN
    ALTER TABLE product_flags 
    ADD CONSTRAINT product_flags_reviewed_by_profiles_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- 3. Update the order_disputes table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_disputes_assigned_to_fkey' 
    AND table_name = 'order_disputes'
  ) THEN
    ALTER TABLE order_disputes DROP CONSTRAINT order_disputes_assigned_to_fkey;
  END IF;
END $$;

-- Add new foreign key to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_disputes_assigned_to_profiles_fkey' 
    AND table_name = 'order_disputes'
  ) THEN
    ALTER TABLE order_disputes 
    ADD CONSTRAINT order_disputes_assigned_to_profiles_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- 4. Update the system_settings table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'system_settings_updated_by_fkey' 
    AND table_name = 'system_settings'
  ) THEN
    ALTER TABLE system_settings DROP CONSTRAINT system_settings_updated_by_fkey;
  END IF;
END $$;

-- Add new foreign key to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'system_settings_updated_by_profiles_fkey' 
    AND table_name = 'system_settings'
  ) THEN
    ALTER TABLE system_settings 
    ADD CONSTRAINT system_settings_updated_by_profiles_fkey 
    FOREIGN KEY (updated_by) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- 5. Update RLS policies that might be referencing admin_users
DO $$ 
BEGIN
  -- Drop policies that reference admin_users
  DROP POLICY IF EXISTS seller_verification_update_policy ON seller_verifications;
  
  -- Create new policies that don't reference admin_users
  -- Instead use user_roles table to check admin status
  CREATE POLICY seller_verification_update_policy ON seller_verifications 
    FOR UPDATE USING (
      -- Only the seller themselves or users with admin role can update
      (auth.uid() = seller_id) OR 
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
    
  -- Make sure seller can still view their own verification data
  DROP POLICY IF EXISTS seller_verification_select_policy ON seller_verifications;
  CREATE POLICY seller_verification_select_policy ON seller_verifications 
    FOR SELECT USING (
      auth.uid() = seller_id OR
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
    
  -- If there was a join with admin_users in any triggers or functions,
  -- we'd update those here, but first use find-admin-references.sql to locate them
END $$;

DROP POLICY IF EXISTS product_flags_update_policy ON product_flags;
CREATE POLICY product_flags_update_policy ON product_flags 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS order_disputes_update_policy ON order_disputes;
CREATE POLICY order_disputes_update_policy ON order_disputes 
FOR UPDATE USING (
  (auth.uid() = reported_by) OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS system_settings_update_policy ON system_settings;
CREATE POLICY system_settings_update_policy ON system_settings 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Add comment to all columns that previously referenced admin_users
COMMENT ON COLUMN seller_verifications.verified_by IS 'ID of admin user who verified the seller (FK to profiles.id where role = admin)';
COMMENT ON COLUMN product_flags.reviewed_by IS 'ID of admin user who reviewed the flag (FK to profiles.id where role = admin)';
COMMENT ON COLUMN order_disputes.assigned_to IS 'ID of admin user assigned to handle the dispute (FK to profiles.id where role = admin)';
COMMENT ON COLUMN system_settings.updated_by IS 'ID of admin user who last updated the setting (FK to profiles.id where role = admin)';