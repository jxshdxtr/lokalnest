-- This migration ensures that all sellers have proper notification preferences
-- First, get all sellers that don't have notification preferences
DO $$
DECLARE
    seller_id UUID;
BEGIN
    FOR seller_id IN 
        -- Get all sellers without notification preferences
        SELECT u.id
        FROM auth.users u
        LEFT JOIN notification_preferences np ON u.id = np.user_id
        WHERE np.user_id IS NULL -- Only get users without preferences
        AND (
            -- Find users who are explicitly sellers
            (u.raw_user_meta_data->>'account_type' = 'seller')
            OR
            -- Or users with seller profiles
            EXISTS (SELECT 1 FROM seller_profiles sp WHERE sp.id = u.id)
        )
    LOOP
        -- Insert default seller preferences
        INSERT INTO notification_preferences (
            user_id,
            order_notifications,
            stock_alerts,
            review_notifications,
            payment_approved_notifications,
            order_shipped_notifications,
            order_delivered_notifications,
            review_reply_notifications,
            price_drop_notifications,
            restocked_notifications,
            promotion_notifications
        ) VALUES (
            seller_id,
            TRUE, -- order_notifications default to true for sellers
            TRUE, -- stock_alerts default to true for sellers
            TRUE, -- review_notifications default to true for sellers
            FALSE, -- payment_approved_notifications default to false for sellers
            FALSE, -- order_shipped_notifications default to false for sellers
            FALSE, -- order_delivered_notifications default to false for sellers  
            FALSE, -- review_reply_notifications default to false for sellers
            FALSE, -- price_drop_notifications default to false for sellers
            FALSE, -- restocked_notifications default to false for sellers
            FALSE  -- promotion_notifications default to false for sellers
        );
        
        RAISE NOTICE 'Added default notification preferences for seller: %', seller_id;
    END LOOP;
END $$;

-- Fix any RPC failures by ensuring the create_order_notification function works properly
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
  SELECT COALESCE(order_notifications, TRUE) INTO is_enabled 
  FROM notification_preferences 
  WHERE user_id = p_user_id;
  
  -- Default to TRUE if no preferences found
  is_enabled := COALESCE(is_enabled, TRUE);
  
  -- Only create notification if enabled
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