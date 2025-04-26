import { supabase } from '@/integrations/supabase/client';

// Types
export interface NotificationPreferences {
  // Seller notification preferences
  order_notifications: boolean;
  stock_alerts: boolean;
  review_notifications: boolean;
  
  // Buyer notification preferences
  payment_approved_notifications: boolean;
  order_shipped_notifications: boolean;
  order_delivered_notifications: boolean;
  review_reply_notifications: boolean;
  price_drop_notifications: boolean;
  restocked_notifications: boolean;
  promotion_notifications: boolean;
}

// Database table type
export interface NotificationPreferencesRecord {
  user_id: string;
  order_notifications: boolean;
  stock_alerts: boolean;
  review_notifications: boolean;
  payment_approved_notifications: boolean;
  order_shipped_notifications: boolean;
  order_delivered_notifications: boolean;
  review_reply_notifications: boolean;
  price_drop_notifications: boolean;
  restocked_notifications: boolean;
  promotion_notifications: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

// Default preferences by account type
export const defaultSellerPreferences: NotificationPreferences = {
  order_notifications: true,
  stock_alerts: true,
  review_notifications: true,
  payment_approved_notifications: false,
  order_shipped_notifications: false,
  order_delivered_notifications: false,
  review_reply_notifications: false,
  price_drop_notifications: false,
  restocked_notifications: false,
  promotion_notifications: false,
};

export const defaultBuyerPreferences: NotificationPreferences = {
  order_notifications: false,
  stock_alerts: false,
  review_notifications: false,
  payment_approved_notifications: true,
  order_shipped_notifications: true,
  order_delivered_notifications: true,
  review_reply_notifications: true,
  price_drop_notifications: true,
  restocked_notifications: true,
  promotion_notifications: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Remove the type casting that might be causing issues
    const { data, error } = await supabase
      .from('notification_preferences' as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.log('Error fetching notification preferences:', error.message);
      // If no record exists, return default based on account type
      const accountType = user.user_metadata?.account_type;
      return accountType === 'seller' ? defaultSellerPreferences : defaultBuyerPreferences;
    }

    if (!data) return null;
    
    // Type assertion to fix the TypeScript error - first cast to unknown
    const preferences = data as unknown as NotificationPreferencesRecord;
    
    // Create a properly typed object from the data
    return {
      order_notifications: Boolean(preferences.order_notifications),
      stock_alerts: Boolean(preferences.stock_alerts),
      review_notifications: Boolean(preferences.review_notifications),
      payment_approved_notifications: Boolean(preferences.payment_approved_notifications ?? defaultBuyerPreferences.payment_approved_notifications),
      order_shipped_notifications: Boolean(preferences.order_shipped_notifications ?? defaultBuyerPreferences.order_shipped_notifications),
      order_delivered_notifications: Boolean(preferences.order_delivered_notifications ?? defaultBuyerPreferences.order_delivered_notifications),
      review_reply_notifications: Boolean(preferences.review_reply_notifications ?? defaultBuyerPreferences.review_reply_notifications),
      price_drop_notifications: Boolean(preferences.price_drop_notifications),
      restocked_notifications: Boolean(preferences.restocked_notifications),
      promotion_notifications: Boolean(preferences.promotion_notifications),
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

// Check if preferences exist
export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if preferences exist
    const { data: existingPrefs, error: queryError } = await supabase
      .from('notification_preferences' as any)
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (queryError) {
      console.log('Error checking existing preferences:', queryError.message);
    }

    // Let's identify which columns actually exist in the database
    // Use a fallback approach with a safer method
    // Determine which columns to use based on what we know
    let availableColumns: string[] = [
      'user_id', 
      'order_notifications', 
      'stock_alerts', 
      'review_notifications', 
      'price_drop_notifications', 
      'restocked_notifications', 
      'promotion_notifications'
    ];

    // Try to determine if the new columns exist by checking for errors
    try {
      // This is just a test query to see if a column exists
      await supabase
        .from('notification_preferences' as any)
        .select('payment_approved_notifications')
        .limit(1);
      
      // If no error, add these columns to our available list
      availableColumns = availableColumns.concat([
        'payment_approved_notifications',
        'order_shipped_notifications',
        'order_delivered_notifications',
        'review_reply_notifications'
      ]);
      
      console.log('New notification columns found in the database');
    } catch (err) {
      console.log('New notification columns not found in the database, using core columns only');
    }

    console.log('Available columns:', availableColumns);

    // Filter the preferences to only include columns that exist in the database
    const filteredPreferences: any = {};
    Object.entries(preferences).forEach(([key, value]) => {
      if (availableColumns.includes(key) || key === 'user_id') {
        filteredPreferences[key] = value;
      } else {
        console.log(`Skipping column "${key}" as it doesn't exist in the database yet`);
      }
    });

    if (existingPrefs) {
      // Update existing preferences
      console.log('Updating existing preferences for user:', user.id);
      const { error } = await supabase
        .from('notification_preferences' as any)
        .update(filteredPreferences)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating notification preferences:', error.message);
        return false;
      }
      return true;
    } else {
      // Create new preferences with required fields only
      console.log('Creating new preferences for user:', user.id);
      
      // Start with user_id which is essential
      const newPreferences: any = {
        user_id: user.id,
      };
      
      // Only add fields that exist in the database
      if (availableColumns.includes('order_notifications')) {
        newPreferences.order_notifications = preferences.order_notifications ?? defaultSellerPreferences.order_notifications;
      }
      
      if (availableColumns.includes('stock_alerts')) {
        newPreferences.stock_alerts = preferences.stock_alerts ?? defaultSellerPreferences.stock_alerts;
      }
      
      if (availableColumns.includes('review_notifications')) {
        newPreferences.review_notifications = preferences.review_notifications ?? defaultSellerPreferences.review_notifications;
      }
      
      if (availableColumns.includes('price_drop_notifications')) {
        newPreferences.price_drop_notifications = preferences.price_drop_notifications ?? defaultBuyerPreferences.price_drop_notifications;
      }
      
      if (availableColumns.includes('restocked_notifications')) {
        newPreferences.restocked_notifications = preferences.restocked_notifications ?? defaultBuyerPreferences.restocked_notifications;
      }
      
      if (availableColumns.includes('promotion_notifications')) {
        newPreferences.promotion_notifications = preferences.promotion_notifications ?? defaultBuyerPreferences.promotion_notifications;
      }
      
      // Add new columns if they exist in the database
      if (availableColumns.includes('payment_approved_notifications')) {
        newPreferences.payment_approved_notifications = preferences.payment_approved_notifications ?? defaultBuyerPreferences.payment_approved_notifications;
      }
      
      if (availableColumns.includes('order_shipped_notifications')) {
        newPreferences.order_shipped_notifications = preferences.order_shipped_notifications ?? defaultBuyerPreferences.order_shipped_notifications;
      }
      
      if (availableColumns.includes('order_delivered_notifications')) {
        newPreferences.order_delivered_notifications = preferences.order_delivered_notifications ?? defaultBuyerPreferences.order_delivered_notifications;
      }
      
      if (availableColumns.includes('review_reply_notifications')) {
        newPreferences.review_reply_notifications = preferences.review_reply_notifications ?? defaultBuyerPreferences.review_reply_notifications;
      }

      console.log('Creating preferences with:', newPreferences);

      const { error } = await supabase
        .from('notification_preferences' as any)
        .insert(newPreferences);

      if (error) {
        console.error('Error inserting notification preferences:', error.message);
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

// Get notifications for the current user
export async function getNotifications(limit = 5): Promise<Notification[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Get unread notification count
export async function getUnreadCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('user_notifications' as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Mark a notification as read
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await (supabase.rpc as any)(
      'mark_user_notification_read',
      { notification_id: notificationId }
    );
    
    return !error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<boolean> {
  try {
    const { error } = await (supabase.rpc as any)('mark_all_user_notifications_read');
    
    return !error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}