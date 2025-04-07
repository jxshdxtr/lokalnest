
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SellerSettings = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Store Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Store Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage src="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?q=80&w=200" />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">Change Logo</Button>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="grid gap-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input id="business_name" placeholder="Your store name" defaultValue="Sample Store" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="business_description">Store Description</Label>
                    <Textarea 
                      id="business_description" 
                      placeholder="Describe your store and what you sell"
                      className="min-h-[100px]"
                      defaultValue="We provide high-quality handcrafted goods made by local artisans."
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input id="contact_email" type="email" defaultValue="contact@samplestore.com" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 000-0000" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input id="website" type="url" defaultValue="https://samplestore.com" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Store Address</Label>
                    <Input id="address" defaultValue="123 Craft Lane, Artisan City" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="founding_year">Founding Year</Label>
                    <Input id="founding_year" type="number" defaultValue="2020" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" defaultValue="facebook.com/samplestore" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input id="instagram" defaultValue="instagram.com/samplestore" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
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
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Payment settings content here</p>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified when a new order is placed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Product Stock Alerts</h3>
                    <p className="text-sm text-muted-foreground">Get notified when products are low in stock</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Customer Reviews</h3>
                    <p className="text-sm text-muted-foreground">Get notified when a customer leaves a review</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerSettings;
