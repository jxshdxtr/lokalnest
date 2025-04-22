-- Comprehensive script to fix ALL admin_users references in the database

-- 1. First, identify and fix the is_admin function if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    -- Drop the existing function
    DROP FUNCTION IF EXISTS is_admin;
    
    -- Create a new version that uses profiles
    CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
      );
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- 2. Drop all triggers that might reference admin_users
DO $$ 
DECLARE
  trigger_rec RECORD;
BEGIN
  FOR trigger_rec IN 
    SELECT 
      tgname AS trigger_name,
      relname AS table_name
    FROM 
      pg_trigger t
    JOIN 
      pg_class c ON t.tgrelid = c.oid
    JOIN 
      pg_proc p ON t.tgfoid = p.oid
    WHERE 
      pg_get_functiondef(p.oid) LIKE '%admin_users%' OR
      pg_get_triggerdef(t.oid) LIKE '%admin_users%'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 
                  trigger_rec.trigger_name, 
                  trigger_rec.table_name);
  END LOOP;
END $$;

-- 3. Recreate seller_verifications table completely
-- First backup existing data
CREATE TABLE IF NOT EXISTS seller_verifications_backup AS 
SELECT * FROM seller_verifications;

-- Drop the existing table and constraints
DROP TABLE IF EXISTS seller_verifications CASCADE;

-- Create a fresh table with proper structure
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

-- Create indices for faster lookups
CREATE INDEX idx_seller_verifications_seller_id ON seller_verifications(seller_id);
CREATE INDEX idx_seller_verifications_status ON seller_verifications(status);
CREATE INDEX idx_seller_verifications_verified_by ON seller_verifications(verified_by);

-- Add column comments
COMMENT ON COLUMN seller_verifications.verified_by IS 'ID of admin user who verified the seller (FK to profiles.id where role = admin)';

-- Set up RLS policies
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;

-- Seller can read their own verification data
CREATE POLICY seller_verification_select_policy ON seller_verifications 
FOR SELECT USING (
  auth.uid() = seller_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only seller can insert their own verification data
CREATE POLICY seller_verification_insert_policy ON seller_verifications 
FOR INSERT WITH CHECK (
  auth.uid() = seller_id
);

-- Seller can update their own records, admins can update any
CREATE POLICY seller_verification_update_policy ON seller_verifications 
FOR UPDATE USING (
  (auth.uid() = seller_id) OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create a trigger for timestamps (without any admin_users references)
CREATE OR REPLACE FUNCTION update_seller_verification_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_verifications_timestamps
BEFORE UPDATE ON seller_verifications
FOR EACH ROW EXECUTE FUNCTION update_seller_verification_timestamps();

-- 4. Update all other tables with admin_users references
-- product_flags
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

-- Add new foreign key referencing profiles instead
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_flags_reviewed_by_profiles_fkey' 
    AND table_name = 'product_flags'
  ) AND EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'product_flags' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE product_flags 
    ADD CONSTRAINT product_flags_reviewed_by_profiles_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- order_disputes
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

-- Add new foreign key referencing profiles instead
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_disputes_assigned_to_profiles_fkey' 
    AND table_name = 'order_disputes'
  ) AND EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'order_disputes' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE order_disputes 
    ADD CONSTRAINT order_disputes_assigned_to_profiles_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- system_settings
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

-- Add new foreign key referencing profiles instead
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'system_settings_updated_by_profiles_fkey' 
    AND table_name = 'system_settings'
  ) AND EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'system_settings' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE system_settings 
    ADD CONSTRAINT system_settings_updated_by_profiles_fkey 
    FOREIGN KEY (updated_by) 
    REFERENCES profiles(id);
  END IF;
END $$;

-- 5. Update all RLS policies that might reference admin_users
-- Drop and recreate policies for all tables
DROP POLICY IF EXISTS product_flags_update_policy ON product_flags;
DROP POLICY IF EXISTS order_disputes_update_policy ON order_disputes;
DROP POLICY IF EXISTS system_settings_update_policy ON system_settings;

-- Only recreate policies for tables that exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_flags') THEN
    CREATE POLICY product_flags_update_policy ON product_flags 
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_disputes') THEN
    CREATE POLICY order_disputes_update_policy ON order_disputes 
    FOR UPDATE USING (
      (auth.uid() = reported_by) OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    CREATE POLICY system_settings_update_policy ON system_settings 
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

-- 6. Add test admin user to profiles if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin' LIMIT 1) THEN
    -- Only insert if there's no admin user
    INSERT INTO profiles (id, full_name, email, role, status, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'System Administrator',
      'admin@example.com',
      'admin',
      'active',
      now(),
      now()
    );
  END IF;
END $$;

-- 7. Restore data from backup for seller_verifications
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_verifications_backup') THEN
    INSERT INTO seller_verifications (
      id, 
      seller_id, 
      document_type, 
      document_url, 
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
      status,
      notes,
      verified_by,
      verification_date,
      created_at,
      updated_at
    FROM seller_verifications_backup
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 8. Drop the backup tables
DROP TABLE IF EXISTS seller_verifications_backup; 