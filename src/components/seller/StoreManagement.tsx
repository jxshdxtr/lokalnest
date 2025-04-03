
import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UploadCloud, Save, Loader2, User, Mail, Phone, MapPin, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SellerProfile {
  id: string;
  business_name: string;
  description: string;
  location: string;
  contact_phone: string;
  contact_email: string;
  logo_url: string;
  is_verified: boolean;
}

const StoreManagement = () => {
  const [profile, setProfile] = useState<SellerProfile>({
    id: '',
    business_name: '',
    description: '',
    location: '',
    contact_phone: '',
    contact_email: '',
    logo_url: '',
    is_verified: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchSellerProfile();
  }, []);
  
  const fetchSellerProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to access your store settings');
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create a new one
          toast.info('Setting up your store profile for the first time');
          
          // Get user details from the profiles table
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!userError && userData) {
            setProfile({
              id: session.user.id,
              business_name: userData.full_name || '',
              description: '',
              location: '',
              contact_phone: userData.phone || '',
              contact_email: userData.email || '',
              logo_url: userData.avatar_url || '',
              is_verified: false
            });
            
            if (userData.avatar_url) {
              setLogoPreview(userData.avatar_url);
            }
          }
        } else {
          throw error;
        }
      }
      
      if (data) {
        setProfile(data);
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      toast.error('Failed to load your store information');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setLogoFile(file);
  };
  
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return profile.logo_url;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      
      // Create store_logos bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage
        .createBucket('store_logos', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
          fileSizeLimit: 5242880 // 5MB
        });

      if (bucketError && bucketError.message !== 'Bucket already exists') {
        console.error('Error creating bucket:', bucketError);
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('store_logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('store_logos')
        .getPublicUrl(data.path);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to update your store settings');
        return;
      }
      
      // Upload logo if a new one was selected
      const logoUrl = await uploadLogo();
      
      const updatedProfile = {
        ...profile,
        logo_url: logoUrl || profile.logo_url
      };
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('seller_profiles')
          .update(updatedProfile)
          .eq('id', session.user.id);
          
        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('seller_profiles')
          .insert({
            ...updatedProfile,
            id: session.user.id
          });
          
        if (error) throw error;
      }
      
      toast.success('Store settings updated successfully');
      setLogoFile(null); // Clear the file input
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast.error('Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>
            Manage your store details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo">Store Logo</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {logoPreview ? (
                    <AvatarImage src={logoPreview} alt="Store logo" />
                  ) : (
                    <AvatarFallback>{profile.business_name?.charAt(0) || 'S'}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-muted text-sm font-medium rounded-md hover:bg-muted/80"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 500x500 pixels
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_name">Store Name</Label>
              <div className="relative">
                <Input
                  id="business_name"
                  name="business_name"
                  value={profile.business_name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea
                id="description"
                name="description"
                value={profile.description || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell customers about your store, what you make, and your story..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input
                    id="location"
                    name="location"
                    value={profile.location || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Manila, Philippines"
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <div className="relative">
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={profile.contact_phone || ''}
                    onChange={handleInputChange}
                    placeholder="+63 XXX XXX XXXX"
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <div className="relative">
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={profile.contact_email || ''}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {profile.is_verified && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800 text-sm flex items-center">
                <svg className="h-5 w-5 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your store is verified. Customers will see a verified badge on your store page.
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreManagement;
