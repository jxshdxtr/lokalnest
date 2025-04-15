
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

export async function getAllProducts(filters: {
  searchQuery?: string;
  category?: string;
  location?: string;
  priceRange?: [number, number];
  sortBy?: string;
}): Promise<ProductWithSeller[]> {
  try {
    // Start building the query
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        is_available,
        stock_quantity,
        categories(name),
        seller_profiles(business_name, location),
        product_images(url, is_primary)
      `)
      .eq('is_available', true)
      .gt('stock_quantity', 0);

    // Apply category filter
    if (filters.category && filters.category !== 'All Categories') {
      query = query.eq('categories.name', filters.category);
    }

    // Apply location filter
    if (filters.location && filters.location !== 'All Locations') {
      query = query.eq('seller_profiles.location', filters.location);
    }

    // Apply price range filter
    if (filters.priceRange) {
      query = query
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1]);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match the expected format
    let formattedProducts = (data || []).map(product => {
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
        category: product.categories ? product.categories.name : 'Uncategorized',
        location: product.seller_profiles?.location || 'Philippines'
      };
    });

    // Apply search filter client-side
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      formattedProducts = formattedProducts.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.seller.toLowerCase().includes(query)
      );
    }

    // Sort products client-side
    if (filters.sortBy) {
      formattedProducts = formattedProducts.sort((a, b) => {
        switch(filters.sortBy) {
          case 'price-low-high':
            return a.price - b.price;
          case 'price-high-low':
            return b.price - a.price;
          case 'name-a-z':
            return a.name.localeCompare(b.name);
          case 'name-z-a':
            return b.name.localeCompare(a.name);
          default:
            return 0; // Keep original order for 'popular'
        }
      });
    }

    return formattedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Failed to load products');
    return [];
  }
}
