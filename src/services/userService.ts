import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interface for the address data we'll fetch from Supabase
export interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: string;
  is_default: boolean | null;
  created_at: string;
  updated_at: string;
}

// Fetch all addresses for the current user
export async function getUserAddresses() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to access your addresses');
    }
    
    // Get addresses from the addresses table
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as Address[];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
}

// Fetch the user's default address (or first available address)
export async function getDefaultAddress() {
  try {
    const addresses = await getUserAddresses();
    
    if (addresses.length === 0) {
      return null;
    }
    
    // Find default address or take the first one
    const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
    return defaultAddress;
  } catch (error) {
    console.error('Error fetching default address:', error);
    return null;
  }
}

// Get user profile data
export async function getUserProfile() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to access your profile');
    }
    
    // Get profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
} 