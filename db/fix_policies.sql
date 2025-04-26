-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = CURRENT_SCHEMA() 
    AND tablename = 'user_notifications'
    AND policyname = 'user_notifications_isolation_policy'
  ) THEN
    DROP POLICY user_notifications_isolation_policy ON user_notifications;
  END IF;
  
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = CURRENT_SCHEMA() 
    AND tablename = 'notification_preferences'
    AND policyname = 'notification_preferences_user_isolation_policy'
  ) THEN
    DROP POLICY notification_preferences_user_isolation_policy ON notification_preferences;
  END IF;
END
$$;

-- Recreate policies
CREATE POLICY user_notifications_isolation_policy ON user_notifications 
  USING (user_id = auth.uid());

CREATE POLICY notification_preferences_user_isolation_policy ON notification_preferences 
  USING (user_id = auth.uid());

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE 
  schemaname = CURRENT_SCHEMA() 
  AND (tablename = 'user_notifications' OR tablename = 'notification_preferences'); 