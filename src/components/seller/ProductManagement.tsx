
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';
import ProductFilters from './ProductFilters';
import ProductToolbar from './ProductToolbar';
import { supabase } from '@/integrations/supabase/client';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSellerVerified, setIsSellerVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  
  // Add state for product management
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPrice, setFilterPrice] = useState({ min: '', max: '' });
  const [filterStock, setFilterStock] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    const checkSellerVerification = async () => {
      try {
        setIsCheckingVerification(true);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        
        // Check if user is a seller
        const userType = session.user.user_metadata?.account_type;
        if (userType !== 'seller') {
          toast.error('This dashboard is only for seller accounts');
          navigate('/');
          return;
        }
        
        // Check seller verification status
        const { data: sellerProfile } = await supabase
          .from('seller_profiles')
          .select('is_verified')
          .eq('id', session.user.id)
          .maybeSingle();
          
        setIsSellerVerified(sellerProfile?.is_verified || false);
        
        // If not verified, check if verification has been submitted
        if (!sellerProfile?.is_verified) {
          const { data: verification, error } = await supabase
            .from('seller_verifications')
            .select('status')
            .eq('seller_id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error('Error checking verification:', error);
          }
          
          // If no verification exists, redirect to verification page
          if (!verification) {
            toast.info('You need to submit your DTI documents for verification first');
            navigate('/seller/verification');
            return;
          } else if (verification.status === 'pending') {
            toast.info('Your seller verification is still pending approval');
          } else if (verification.status === 'rejected') {
            toast.error('Your seller verification was rejected. Please contact support.');
          }
        }
      } catch (error) {
        console.error('Error checking seller verification:', error);
      } finally {
        setIsCheckingVerification(false);
      }
    };
    
    checkSellerVerification();
  }, [navigate]);

  // Add effect to fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories:category_id (name)
          `)
          .eq('seller_id', session.user.id);
          
        if (error) throw error;
        
        // Also fetch product images
        const productsWithImages = await Promise.all(
          (data || []).map(async (product) => {
            const { data: images } = await supabase
              .from('product_images')
              .select('url')
              .eq('product_id', product.id)
              .order('is_primary', { ascending: false })
              .limit(1);
              
            return {
              ...product,
              image: images && images.length > 0 ? images[0].url : null,
              category_name: product.categories?.name
            };
          })
        );
        
        setProducts(productsWithImages);
        setFilteredProducts(productsWithImages);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [isCreateOpen, isDetailOpen]);

  // Add effect to fetch categories
  useEffect(() => {
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
    
    fetchCategories();
  }, []);

  // Add effect to filter products based on search and filters
  useEffect(() => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply price filter
    if (filterPrice.min && !isNaN(Number(filterPrice.min))) {
      filtered = filtered.filter(product => product.price >= Number(filterPrice.min));
    }
    
    if (filterPrice.max && !isNaN(Number(filterPrice.max))) {
      filtered = filtered.filter(product => product.price <= Number(filterPrice.max));
    }
    
    // Apply stock filter
    if (filterStock !== 'all') {
      if (filterStock === 'in_stock') {
        filtered = filtered.filter(product => product.stock_quantity > 0);
      } else if (filterStock === 'low_stock') {
        filtered = filtered.filter(product => product.stock_quantity > 0 && product.stock_quantity < 10);
      } else if (filterStock === 'out_of_stock') {
        filtered = filtered.filter(product => product.stock_quantity === 0);
      }
    }
    
    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(product => product.category_id === filterCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, filterPrice, filterStock, filterCategory, products]);

  const handleViewProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setIsDetailOpen(true);
  };

  const handleCreateNew = () => {
    if (!isSellerVerified) {
      toast.error('Your account must be verified before you can add products');
      return;
    }
    setIsCreateOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setFilterPrice({ min: '', max: '' });
    setFilterStock('all');
    setFilterCategory('');
    setSearchTerm('');
  };

  const handleEditProduct = (product: any) => {
    // Implement edit functionality
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (productId: string) => {
    // Implement delete functionality
    console.log('Delete product:', productId);
  };

  const handleDuplicateProduct = (product: any) => {
    // Implement duplicate functionality
    console.log('Duplicate product:', product);
  };

  if (isCheckingVerification) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">Checking verification status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isSellerVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <h3 className="font-medium text-amber-800">Account Verification Required</h3>
          <p className="text-amber-700 text-sm mt-1">
            Your seller account is pending verification. You can view products but cannot add new ones until your account is verified.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-xl font-semibold">Product Management</h1>
        <Button 
          onClick={handleCreateNew} 
          className="flex items-center gap-1"
          disabled={!isSellerVerified}
        >
          <PlusCircle size={16} />
          <span>Add Product</span>
        </Button>
      </div>

      <ProductToolbar 
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        handleAddProduct={handleCreateNew}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        categories={categories}
      />
      
      <ProductFilters 
        filterPrice={filterPrice}
        setFilterPrice={setFilterPrice}
        filterStock={filterStock}
        setFilterStock={setFilterStock}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        resetFilters={resetFilters}
        categories={categories}
        setIsFilterOpen={setIsFilterOpen}
      />
      
      <ProductTable 
        products={products}
        loading={loading}
        filteredProducts={filteredProducts}
        handleEditProduct={handleEditProduct}
        handleViewProduct={(product) => handleViewProductDetail(product.id)}
        handleDeleteProduct={handleDeleteProduct}
        handleDuplicateProduct={handleDuplicateProduct}
      />

      {isCreateOpen && (
        <ProductFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={() => {
            setIsCreateOpen(false);
            // Refresh products after save
            // This will be handled by the useEffect
          }}
        />
      )}

      {isDetailOpen && selectedProductId && (
        <ProductDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          product={products.find(p => p.id === selectedProductId) || {}}
        />
      )}
    </div>
  );
};

export default ProductManagement;
