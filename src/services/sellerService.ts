import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// The SellerProfile type should match EXACTLY what's in the database
export type SellerProfile = {
  id: string;
  business_name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;  // Changed from phone to match database
  website?: string | null;
  address?: string | null;
  founding_year?: number | null;
  facebook?: string | null;
  instagram?: string | null;
  logo_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string | null;
  is_verified: boolean | null;
};

type SellerProfileInput = Omit<Partial<SellerProfile>, 'created_at' | 'updated_at'> & {
  id: string;
};

// Get the seller profile for the current logged-in user
export async function getCurrentSellerProfile(): Promise<SellerProfile | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to access your seller profile');
    }
    
    return getSellerProfile(user.id);
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    return null;
  }
}

// Get seller profile by ID
export async function getSellerProfile(sellerId: string): Promise<SellerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', sellerId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as SellerProfile;
  } catch (error) {
    console.error(`Error fetching seller profile for ID ${sellerId}:`, error);
    return null;
  }
}

// Check if the current user is a seller
export async function isCurrentUserSeller(): Promise<boolean> {
  try {
    const profile = await getCurrentSellerProfile();
    return !!profile;
  } catch (error) {
    return false;
  }
}

// Update seller profile
export async function updateSellerProfile(profileData: Partial<SellerProfile>): Promise<boolean> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to update your seller profile');
    }
    
    // Check if user has a profile first
    const { data: existingProfile, error: checkError } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', checkError);
      throw new Error(`Failed to check for existing profile: ${checkError.message}`);
    }
    
    // If no profile exists, create one first
    if (!existingProfile) {
      console.log('No profile exists yet, creating one first');
      const result = await initializeSellerProfile(profileData);
      return !!result;
    }
    
    // Log the data being sent to the database
    console.log('Updating profile with data:', profileData);
    
    // Update the profile
    const { error: updateError } = await supabase
      .from('seller_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating seller profile:', error);
    throw error; // Let the caller handle the error
  }
}

// Create or initialize a seller profile
export async function initializeSellerProfile(initialData?: Partial<SellerProfile>): Promise<SellerProfile | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to initialize a seller profile');
    }
    
    // Check if the profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Only proceed if there's no profile or we got a "not found" error
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', profileError);
      throw new Error(`Error checking for existing profile: ${profileError.message}`);
    }
    
    // If profile exists, return it
    if (existingProfile) {
      console.log('Profile already exists, no initialization needed');
      return existingProfile as SellerProfile;
    }
    
    // Create a new profile with defaults and make sure id is set
    const newProfileData: SellerProfileInput = {
      id: user.id,
      business_name: initialData?.business_name || 'My Store',
      description: initialData?.description || '',
      contact_email: initialData?.contact_email || '',
      contact_phone: initialData?.contact_phone || '',
      website: initialData?.website || '',
      address: initialData?.address || '',
      founding_year: initialData?.founding_year || null,
      facebook: initialData?.facebook || '',
      instagram: initialData?.instagram || '',
      logo_url: initialData?.logo_url || '',
      location: initialData?.location || '',
      is_verified: initialData?.is_verified || false
    };
    
    console.log('Creating new seller profile with data:', newProfileData);
    
    // Make sure business_name is not undefined since it's required in the database schema
    const profileToInsert = {
      ...newProfileData,
      business_name: newProfileData.business_name || 'My Store', // Ensure business_name is never undefined
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the new profile with timestamps
    const { data: newProfile, error: insertError } = await supabase
      .from('seller_profiles')
      .insert(profileToInsert)
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating seller profile:', insertError);
      throw new Error(`Failed to create seller profile: ${insertError.message}`);
    }
    
    toast.success('Seller profile created successfully');
    return newProfile as SellerProfile;
  } catch (error) {
    console.error('Error in initializeSellerProfile:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to initialize seller profile');
    return null;
  }
}

// Get seller's products 
export async function getSellerProducts(sellerId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        sale_price,
        description,
        stock_quantity,
        categories(name),
        product_images(url, is_primary)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Format the products
    return data.map(product => {
      const productImages = Array.isArray(product.product_images) ? product.product_images : [];
      const primaryImage = productImages.find(img => img?.is_primary);
      const image = primaryImage 
        ? primaryImage.url 
        : (productImages.length > 0 ? productImages[0].url : '');
        
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        sale_price: product.sale_price,
        description: product.description,
        stock_quantity: product.stock_quantity,
        category: product.categories ? product.categories.name : 'Uncategorized',
        image: image
      };
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return [];
  }
}