-- Drop the problematic notification trigger
DROP TRIGGER IF EXISTS seller_verification_notification_trigger ON seller_verifications;

-- Check and fix the notification function
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_seller_verification_notification') THEN
    -- Drop the existing function
    DROP FUNCTION IF EXISTS create_seller_verification_notification();
    
    -- Create a new version that uses profiles instead of admin_users
    CREATE OR REPLACE FUNCTION create_seller_verification_notification()
    RETURNS TRIGGER AS $FUNC$
    BEGIN
      -- Insert notification for admins (using profiles table)
      INSERT INTO notifications (
        user_id,
        content,
        notification_type,
        is_read
      )
      SELECT 
        id as user_id,
        'New seller verification request from ' || NEW.business_name,
        'seller_verification',
        false
      FROM profiles
      WHERE role = 'admin';
      
      RETURN NEW;
    END;
    $FUNC$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Recreate the trigger with the fixed function
CREATE TRIGGER seller_verification_notification_trigger
AFTER INSERT ON seller_verifications
FOR EACH ROW
EXECUTE FUNCTION create_seller_verification_notification();