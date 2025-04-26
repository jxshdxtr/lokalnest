-- Script to add any missing columns to the notification_preferences table
-- This will only add columns if they don't already exist

DO $$
BEGIN
  -- Add payment_approved_notifications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'payment_approved_notifications'
  ) THEN
    ALTER TABLE notification_preferences 
    ADD COLUMN payment_approved_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add order_shipped_notifications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'order_shipped_notifications'
  ) THEN
    ALTER TABLE notification_preferences 
    ADD COLUMN order_shipped_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add order_delivered_notifications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'order_delivered_notifications'
  ) THEN
    ALTER TABLE notification_preferences 
    ADD COLUMN order_delivered_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add review_reply_notifications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notification_preferences' 
    AND column_name = 'review_reply_notifications'
  ) THEN
    ALTER TABLE notification_preferences 
    ADD COLUMN review_reply_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Log that the script ran successfully
  RAISE NOTICE 'All missing columns added successfully';
END
$$;

-- Verify the columns now exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'notification_preferences'
ORDER BY column_name; 