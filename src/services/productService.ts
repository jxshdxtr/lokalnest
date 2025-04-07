
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ProductWithSeller = {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  category: string;
  location: string;
};

export async function getFeaturedProducts(): Promise<ProductWithSeller[]> {
  try {
    // Fetch featured products with seller info
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        is_available,
        stock_quantity,
        categories!inner(name),
        seller_profiles!inner(business_name, location),
        product_images(url, is_primary)
      `)
      .eq('featured', true)
      .eq('is_available', true)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    // Transform data to match the expected format
    const formattedProducts = (data || []).map(product => {
      // Find primary image or use first available
      const primaryImage = product.product_images.find(img => img.is_primary);
      const image = primaryImage 
        ? primaryImage.url 
        : (product.product_images.length > 0 ? product.product_images[0].url : '');

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: image,
        seller: product.seller_profiles.business_name,
        category: product.categories.name,
        location: product.seller_profiles.location || 'Philippines'
      };
    });

    return formattedProducts;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    toast.error('Failed to load featured products');
    return [];
  }
}
