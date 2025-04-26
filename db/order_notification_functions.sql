-- Function to create an order notification for sellers (new orders)
CREATE OR REPLACE FUNCTION create_order_notification(
  p_user_id UUID, -- the seller's ID
  p_order_id UUID, 
  p_title VARCHAR DEFAULT NULL,
  p_message VARCHAR DEFAULT NULL,
  p_type VARCHAR DEFAULT 'new_order'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  is_enabled BOOLEAN;
BEGIN
  -- Check if the seller has notifications enabled
  is_enabled := user_has_notification_enabled(p_user_id, 'order');
  
  -- Only create notification if enabled (defaults to TRUE if no preference found)
  IF is_enabled THEN
    -- Insert the notification into user_notifications
    INSERT INTO user_notifications (
      user_id,
      type,
      title,
      message,
      data,
      read
    ) VALUES (
      p_user_id,
      p_type,
      COALESCE(p_title, 'New Order Received'),
      COALESCE(p_message, 'You have received a new order #' || p_order_id || '. Please review and process it.'),
      jsonb_build_object('order_id', p_order_id),
      FALSE
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
  ELSE
    -- Return NULL if notifications are disabled
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user has enabled a specific notification type
CREATE OR REPLACE FUNCTION user_has_notification_enabled(
  p_user_id UUID,
  p_notification_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  is_enabled BOOLEAN;
BEGIN
  -- Try to get the preference value for the specified notification type
  EXECUTE format('
    SELECT COALESCE(%I, TRUE) 
    FROM notification_preferences 
    WHERE user_id = $1', 
    p_notification_type || '_notifications'
  ) INTO is_enabled USING p_user_id;
  
  -- If no preference record exists, default to enabled (TRUE)
  RETURN COALESCE(is_enabled, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example of using the helper function:
-- SELECT user_has_notification_enabled('user-uuid-here', 'order');
-- SELECT user_has_notification_enabled('user-uuid-here', 'payment_approved');

-- Function to check if the user has enabled the notification type before creating
CREATE OR REPLACE FUNCTION create_notification_if_enabled(
  p_user_id UUID,
  p_notification_type VARCHAR,
  p_title VARCHAR,
  p_message VARCHAR,
  p_data JSONB
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  enabled BOOLEAN;
BEGIN
  -- Check if this notification type is enabled for the user
  enabled := user_has_notification_enabled(p_user_id, p_notification_type);
  
  -- Only create the notification if it's enabled
  IF enabled THEN
    INSERT INTO user_notifications (
      user_id,
      type,
      title,
      message,
      data,
      read
    ) VALUES (
      p_user_id,
      p_notification_type,
      p_title,
      p_message,
      p_data,
      FALSE
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
  ELSE
    -- Return NULL if notifications are disabled
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 