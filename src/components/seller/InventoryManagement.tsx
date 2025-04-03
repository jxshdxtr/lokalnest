
import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  PlusCircle,
  MinusCircle,
  History,
  FileText,
  ArrowUpDown,
  Check,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  sku?: string;
  stock_quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  category?: string;
  last_updated?: string;
}

interface InventoryLog {
  id: string;
  product_id: string;
  product_name: string;
  previous_quantity: number;
  new_quantity: number;
  change_quantity: number;
  reason: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
}

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [quantityReason, setQuantityReason] = useState('');
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [selectedProductLogs, setSelectedProductLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchInventoryLogs();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view inventory');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock_quantity,
          updated_at,
          categories:category_id(name)
        `)
        .eq('seller_id', session.user.id)
        .order('name');
      
      if (error) throw error;

      // Transform to our Product interface
      const transformedProducts = data.map((p: any) => {
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        
        if (p.stock_quantity <= 0) {
          status = 'out_of_stock';
        } else if (p.stock_quantity < 10) {
          status = 'low_stock';
        }
        
        return {
          id: p.id,
          name: p.name,
          stock_quantity: p.stock_quantity,
          status,
          category: p.categories?.name || 'Uncategorized',
          last_updated: p.updated_at
        };
      });
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use RPC function to get inventory logs
      const { data, error } = await supabase.rpc('get_inventory_logs', {
        seller_id_param: session.user.id
      });
      
      if (error) {
        console.error('Error fetching inventory logs:', error);
        // Provide some mock data as fallback
        const mockLogs: InventoryLog[] = [
          {
            id: '1',
            product_id: '1',
            product_name: 'Mock Product',
            previous_quantity: 10,
            new_quantity: 15,
            change_quantity: 5,
            reason: 'Stock replenishment',
            created_by_name: 'System User',
            created_at: new Date().toISOString()
          }
        ];
        setInventoryLogs(mockLogs);
        return;
      }
      
      setInventoryLogs(data || []);
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
    }
  };

  const openStockUpdateDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewQuantity(product.stock_quantity);
    setQuantityReason('');
    setIsStockUpdateDialogOpen(true);
  };

  const openHistoryDialog = (product: Product) => {
    if (inventoryLogs.length > 0) {
      const productLogs = inventoryLogs.filter(log => 
        log.product_id === product.id
      );
      setSelectedProductLogs(productLogs);
      setSelectedProduct(product);
      setIsHistoryDialogOpen(true);
    } else {
      toast.info('No history available for this product');
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct) return;
    
    try {
      // Use RPC function to update product stock
      const { error } = await supabase.rpc('update_product_stock', {
        product_id_param: selectedProduct.id,
        new_quantity_param: newQuantity,
        reason_param: quantityReason || 'Manual stock adjustment'
      });
      
      if (error) throw error;
      
      // Update local state
      setProducts(products.map(p => {
        if (p.id === selectedProduct.id) {
          let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
          if (newQuantity <= 0) {
            status = 'out_of_stock';
          } else if (newQuantity < 10) {
            status = 'low_stock';
          }
          
          return {
            ...p,
            stock_quantity: newQuantity,
            status,
            last_updated: new Date().toISOString()
          };
        }
        return p;
      }));
      
      // Refresh inventory logs
      fetchInventoryLogs();
      
      toast.success(`Updated "${selectedProduct.name}" stock to ${newQuantity}`);
      setIsStockUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Apply filters
  const filteredProducts = products.filter(product => {
    // Search filter
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Status filter
    const statusMatch = statusFilter === 'all' || product.status === statusFilter;
    
    return searchMatch && categoryMatch && statusMatch;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(products.map(p => p.category || 'Uncategorized'))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'low_stock').length}</p>
              </div>
              <PlusCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'out_of_stock').length}</p>
              </div>
              <MinusCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                className="w-full sm:w-auto flex items-center"
                onClick={() => {
                  fetchProducts();
                  fetchInventoryLogs();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-center">{product.stock_quantity}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(product.status)}</TableCell>
                      <TableCell>{product.last_updated ? formatTimeAgo(product.last_updated) : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openHistoryDialog(product)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            <span className="hidden md:inline">History</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openStockUpdateDialog(product)}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-1" />
                            <span className="hidden md:inline">Update</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search filters.'
                  : "You don't have any products yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={isStockUpdateDialogOpen} onOpenChange={setIsStockUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Stock: {selectedProduct?.stock_quantity}</label>
              <Input
                type="number"
                value={newQuantity}
                onChange={e => setNewQuantity(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for Update</label>
              <Input
                placeholder="e.g., New shipment arrived, Stock count adjustment"
                value={quantityReason}
                onChange={e => setQuantityReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockUpdate}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Inventory History: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              View all stock changes for this product
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-96">
            {selectedProductLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Updated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProductLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{formatTimeAgo(log.created_at)}</TableCell>
                      <TableCell>{log.previous_quantity}</TableCell>
                      <TableCell>{log.new_quantity}</TableCell>
                      <TableCell>
                        <span className={log.change_quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {log.change_quantity > 0 ? '+' : ''}{log.change_quantity}
                        </span>
                      </TableCell>
                      <TableCell>{log.reason || 'No reason provided'}</TableCell>
                      <TableCell>{log.created_by_name || 'System'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No history available for this product</p>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
