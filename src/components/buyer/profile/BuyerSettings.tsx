import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  NotificationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences
} from '@/services/notificationService';

const BuyerSettings = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    order_notifications: false,
    stock_alerts: false,
    review_notifications: false,
    payment_approved_notifications: true,
    order_shipped_notifications: true,
    order_delivered_notifications: true,
    review_reply_notifications: true,
    price_drop_notifications: true,
    restocked_notifications: true,
    promotion_notifications: true
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadBuyerProfile() {
      setLoading(true);
      try {
        // Here you would load the buyer's profile data
        // For now, just load notification preferences
        const notifPrefs = await getNotificationPreferences();
        if (notifPrefs) {
          setNotificationPrefs(notifPrefs);
        }
      } catch (error) {
        console.error("Error loading buyer profile:", error);
        toast.error("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    }

    loadBuyerProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      // Here you would update the buyer's profile
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveNotificationPreferences = async () => {
    setSavingNotifications(true);
    try {
      const success = await updateNotificationPreferences(notificationPrefs);
      
      if (success) {
        toast.success("Notification preferences updated", {
          description: "Your notification settings have been saved.",
          icon: <Check className="h-4 w-4" />,
          duration: 3000,
        });
      } else {
        throw new Error("Failed to update preferences");
      }
      
      return success;
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Failed to save notification preferences");
      return false;
    } finally {
      setSavingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input 
                    id="full_name" 
                    value={profileData.full_name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Account settings content here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Your Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Address management content here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Order Updates</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Payment Approved</h3>
                    <p className="text-sm text-muted-foreground">Get notified when your payment is approved</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.payment_approved_notifications}
                    onCheckedChange={() => handleNotificationToggle('payment_approved_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order Shipped</h3>
                    <p className="text-sm text-muted-foreground">Get notified when your order is shipped</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.order_shipped_notifications}
                    onCheckedChange={() => handleNotificationToggle('order_shipped_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order Delivered</h3>
                    <p className="text-sm text-muted-foreground">Get notified when your order is delivered</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.order_delivered_notifications}
                    onCheckedChange={() => handleNotificationToggle('order_delivered_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Review Replies</h3>
                    <p className="text-sm text-muted-foreground">Get notified when a seller replies to your review</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.review_reply_notifications}
                    onCheckedChange={() => handleNotificationToggle('review_reply_notifications')}
                  />
                </div>
                
                <div className="border-t my-4 pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Shopping Notifications</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Price Drop Alerts</h3>
                    <p className="text-sm text-muted-foreground">Get notified when products on your wishlist drop in price</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.price_drop_notifications}
                    onCheckedChange={() => handleNotificationToggle('price_drop_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Back in Stock Alerts</h3>
                    <p className="text-sm text-muted-foreground">Get notified when out-of-stock items are available again</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.restocked_notifications}
                    onCheckedChange={() => handleNotificationToggle('restocked_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Promotions & Offers</h3>
                    <p className="text-sm text-muted-foreground">Get notified about exclusive deals and promotions</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.promotion_notifications}
                    onCheckedChange={() => handleNotificationToggle('promotion_notifications')}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSaveNotificationPreferences}
                    disabled={savingNotifications}
                    className="mt-2"
                  >
                    {savingNotifications ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerSettings; 