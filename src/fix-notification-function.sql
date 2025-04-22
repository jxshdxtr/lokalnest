-- Fix the notification function for seller verifications

-- First, check the structure of the notifications table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications';

-- Drop the existing notification trigger
DROP TRIGGER IF EXISTS seller_verification_notification_trigger ON seller_verifications;

-- Drop the existing function
DROP FUNCTION IF EXISTS create_seller_verification_notification();

-- Create a new version that properly sets all required fields
CREATE OR REPLACE FUNCTION create_seller_verification_notification()
RETURNS TRIGGER AS $$
DECLARE
    seller_name TEXT;
    notification_content TEXT;
BEGIN
    -- Get the seller information
    SELECT business_name INTO seller_name 
    FROM seller_verifications 
    WHERE id = NEW.id;
    
    -- Fallback to generic content if business_name is null
    IF seller_name IS NULL THEN
        notification_content := 'New seller verification request submitted';
    ELSE
        notification_content := 'New seller verification request from ' || seller_name;
    END IF;
    
    -- Insert notification for admins
    INSERT INTO notifications (
        user_id,
        content,
        notification_type,
        is_read,
        created_at
    )
    SELECT 
        id as user_id,
        notification_content,
        'seller_verification',
        false,
        NOW()
    FROM profiles
    WHERE role = 'admin';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with the fixed function
CREATE TRIGGER seller_verification_notification_trigger
AFTER INSERT ON seller_verifications
FOR EACH ROW
EXECUTE FUNCTION create_seller_verification_notification(); 