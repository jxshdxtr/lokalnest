-- User Notifications table (separate from existing seller verification notifications)
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- e.g., 'new_order', 'low_stock', 'new_review', 'price_drop', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional structured data related to the notification
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Seller notification preferences
  order_notifications BOOLEAN DEFAULT TRUE,
  stock_alerts BOOLEAN DEFAULT TRUE,
  review_notifications BOOLEAN DEFAULT TRUE,
  
  -- Buyer notification preferences - general
  price_drop_notifications BOOLEAN DEFAULT TRUE,
  restocked_notifications BOOLEAN DEFAULT TRUE,
  promotion_notifications BOOLEAN DEFAULT TRUE,
  
  -- Buyer notification preferences - order status
  payment_approved_notifications BOOLEAN DEFAULT TRUE,
  order_shipped_notifications BOOLEAN DEFAULT TRUE,
  order_delivered_notifications BOOLEAN DEFAULT TRUE,
  review_reply_notifications BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = CURRENT_SCHEMA() 
    AND tablename = 'user_notifications'
    AND policyname = 'user_notifications_isolation_policy'
  ) THEN
    CREATE POLICY user_notifications_isolation_policy ON user_notifications 
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- RLS Policies for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = CURRENT_SCHEMA() 
    AND tablename = 'notification_preferences'
    AND policyname = 'notification_preferences_user_isolation_policy'
  ) THEN
    CREATE POLICY notification_preferences_user_isolation_policy ON notification_preferences 
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_user_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_notifications
  SET read = TRUE
  WHERE id = notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_user_notifications_read()
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_notifications
  SET read = TRUE
  WHERE user_id = auth.uid() AND read = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper functions for creating different types of notifications

-- Function to create an order status notification
CREATE OR REPLACE FUNCTION create_order_status_notification(
  p_user_id UUID,
  p_order_id UUID,
  p_status VARCHAR,
  p_title VARCHAR DEFAULT NULL,
  p_message VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  status_title VARCHAR;
  status_message VARCHAR;
BEGIN
  -- Set default title and message based on status
  IF p_status = 'payment_approved' THEN
    status_title := COALESCE(p_title, 'Payment Approved');
    status_message := COALESCE(p_message, 'Your payment has been approved for order #' || p_order_id);
  ELSIF p_status = 'shipped' THEN
    status_title := COALESCE(p_title, 'Order Shipped');
    status_message := COALESCE(p_message, 'Your order #' || p_order_id || ' has been shipped');
  ELSIF p_status = 'delivered' THEN
    status_title := COALESCE(p_title, 'Order Delivered');
    status_message := COALESCE(p_message, 'Your order #' || p_order_id || ' has been delivered');
  ELSE
    status_title := COALESCE(p_title, 'Order Update');
    status_message := COALESCE(p_message, 'Your order status has been updated');
  END IF;

  -- Insert the notification
  INSERT INTO user_notifications (
    user_id,
    type,
    title,
    message,
    data,
    read
  ) VALUES (
    p_user_id,
    p_status,
    status_title,
    status_message,
    jsonb_build_object('order_id', p_order_id, 'status', p_status),
    FALSE
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a review reply notification
CREATE OR REPLACE FUNCTION create_review_reply_notification(
  p_user_id UUID,
  p_review_id UUID,
  p_product_id UUID,
  p_seller_name VARCHAR,
  p_title VARCHAR DEFAULT NULL,
  p_message VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Insert the notification
  INSERT INTO user_notifications (
    user_id,
    type,
    title,
    message,
    data,
    read
  ) VALUES (
    p_user_id,
    'review_reply',
    COALESCE(p_title, p_seller_name || ' replied to your review'),
    COALESCE(p_message, p_seller_name || ' has responded to your review'),
    jsonb_build_object('review_id', p_review_id, 'product_id', p_product_id, 'seller_name', p_seller_name),
    FALSE
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 