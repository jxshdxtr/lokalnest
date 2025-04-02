
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Copy,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Define product interface
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
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
  const [filterStock, setFilterStock] = useState<string>('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
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
          categories:category_id(name)
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
            category: product.category_id, // Use the direct category_id property instead of trying to access it through categories
            category_name: product.categories?.name,
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

  const applyFilters = (product: Product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      '';
    
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

  const handleSaveProduct = (productData: any) => {
    fetchProducts(); // Refresh products from the database
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setFilterPrice({ min: '', max: '' });
    setFilterStock('all');
    setFilterCategory('');
    setIsFilterOpen(false);
  };

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Products</h4>
                    
                    <div className="space-y-2">
                      <Label>Price Range</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          min="0"
                          value={filterPrice.min}
                          onChange={(e) => setFilterPrice({ ...filterPrice, min: e.target.value })}
                        />
                        <span>to</span>
                        <Input
                          placeholder="Max"
                          type="number"
                          min="0"
                          value={filterPrice.max}
                          onChange={(e) => setFilterPrice({ ...filterPrice, max: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={filterCategory}
                        onValueChange={setFilterCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Stock Status</Label>
                      <Select
                        value={filterStock}
                        onValueChange={setFilterStock}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Stock Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stock Status</SelectItem>
                          <SelectItem value="in_stock">In Stock</SelectItem>
                          <SelectItem value="low_stock">Low Stock</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Reset
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={handleAddProduct} className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="p-3 text-sm font-medium">Product</th>
                  <th className="p-3 text-sm font-medium">Category</th>
                  <th className="p-3 text-sm font-medium">Price</th>
                  <th className="p-3 text-sm font-medium">Stock</th>
                  <th className="p-3 text-sm font-medium">Status</th>
                  <th className="p-3 text-sm font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                                <SlidersHorizontal className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="truncate max-w-[200px]">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{product.category_name || 'Uncategorized'}</td>
                      <td className="p-3 text-sm">₱{product.price.toFixed(2)}</td>
                      <td className="p-3 text-sm">{product.stock}</td>
                      <td className="p-3 text-sm">
                        {getStatusBadge(product.status, product.stock)}
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No products found. Try adjusting your search or filters, or add a new product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
