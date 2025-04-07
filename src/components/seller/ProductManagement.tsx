
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';
import ProductTable from './ProductTable';
import ProductToolbar from './ProductToolbar';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Define product interface
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  categories?: {
    name: string;
  };
  category_name?: string;
  stock: number;
  status: string;
  description?: string;
  created_at?: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  // Filter states
  const [filterPrice, setFilterPrice] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [filterStock, setFilterStock] = useState<string>('all'); 
  const [filterCategory, setFilterCategory] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view your products');
        navigate('/auth');
        return;
      }
      
      // Fetch products with category names
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          stock_quantity,
          created_at,
          category_id,
          categories(name)
        `)
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch product images
      const productsWithImages = await Promise.all(
        (data || []).map(async (product) => {
          const { data: images } = await supabase
            .from('product_images')
            .select('url')
            .eq('product_id', product.id)
            .eq('is_primary', true)
            .limit(1);
          
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            image: images && images.length > 0 ? images[0].url : undefined,
            category: product.category_id,
            categories: product.categories,
            stock: product.stock_quantity,
            status: product.stock_quantity > 0 
              ? (product.stock_quantity < 10 ? 'low_stock' : 'active') 
              : 'out_of_stock',
            created_at: product.created_at
          };
        })
      );
      
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const applyFilters = (product: Product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesPrice = 
      (filterPrice.min === '' || product.price >= parseFloat(filterPrice.min)) &&
      (filterPrice.max === '' || product.price <= parseFloat(filterPrice.max));
    
    let matchesStock = true;
    if (filterStock === 'in_stock') {
      matchesStock = product.stock > 0;
    } else if (filterStock === 'low_stock') {
      matchesStock = product.stock > 0 && product.stock < 10;
    } else if (filterStock === 'out_of_stock') {
      matchesStock = product.stock === 0;
    }
    
    const matchesCategory = 
      filterCategory === '' || product.category === filterCategory;
    
    return matchesSearch && matchesPrice && matchesStock && matchesCategory;
  };

  const filteredProducts = products.filter(applyFilters);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) throw error;
      
      setProducts(products.filter(product => product.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicateProduct = (product: any) => {
    const newProduct = {
      ...product,
      name: `${product.name} (Copy)`,
      id: undefined
    };
    
    setEditingProduct(newProduct);
    setIsModalOpen(true);
  };

  const handleSaveProduct = () => {
    fetchProducts(); // Refresh products from the database
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setFilterPrice({ min: '', max: '' });
    setFilterStock('all');
    setFilterCategory('');
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <ProductToolbar
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleAddProduct={handleAddProduct}
            isFilterOpen={isFilterOpen}
            toggleFilter={toggleFilter}
            filterPrice={filterPrice}
            setFilterPrice={setFilterPrice}
            filterStock={filterStock}
            setFilterStock={setFilterStock}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            resetFilters={resetFilters}
          />

          <ProductTable 
            products={products}
            loading={loading}
            filteredProducts={filteredProducts}
            handleEditProduct={handleEditProduct}
            handleViewProduct={handleViewProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleDuplicateProduct={handleDuplicateProduct}
          />
        </CardContent>
      </Card>

      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={editingProduct}
        />
      )}

      {isViewModalOpen && viewingProduct && (
        <ProductDetailModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          product={viewingProduct}
        />
      )}
    </div>
  );
};

export default ProductManagement;
