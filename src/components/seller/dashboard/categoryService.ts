
import { supabase } from '@/integrations/supabase/client';
import { CategoryData } from './types';

export async function fetchCategoryData(sellerId: string): Promise<CategoryData[]> {
  try {
    // Get all categories with products from this seller
    const { data: productsData, error } = await supabase
      .from('products')
      .select('id, category_id, categories:category_id(name)')
      .eq('seller_id', sellerId);
    
    if (error) throw error;
    
    // Count products by category
    const categoryCounts: { [key: string]: number } = {};
    
    productsData?.forEach(product => {
      const categoryName = product.categories?.name || 'Uncategorized';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });
    
    // Convert to chart data format
    const categoryChartData: CategoryData[] = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: count
    }));
    
    return categoryChartData.length > 0 ? categoryChartData : [
      { name: 'No Products', value: 1 }
    ];
    
  } catch (error) {
    console.error('Error fetching category data:', error);
    throw error;
  }
}
