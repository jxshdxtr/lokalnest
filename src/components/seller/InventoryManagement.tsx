
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FileDown,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Package,
  Edit,
  RotateCcw,
  History,
  Bell,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category_name?: string;
  category_id?: string;
  stock: number;
  alert_threshold?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  location?: string;
  last_updated: string;
  image?: string;
}

interface InventoryLog {
  id: string;
  product_id: string;
  previous_quantity: number;
  new_quantity: number;
  change_quantity: number;
  reason: string;
  created_at: string;
}

const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view your inventory');
        navigate('/auth');
        return;
      }
      
      // Fetch products with category names
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock_quantity,
          updated_at,
          category_id,
          categories:category_id(name)
        `)
        .eq('seller_id', session.user.id)
        .order('name');
      
      if (error) throw error;
      
      // Fetch product images
      const inventoryWithImages = await Promise.all(
        (data || []).map(async (product) => {
          const { data: images } = await supabase
            .from('product_images')
            .select('url')
            .eq('product_id', product.id)
            .eq('is_primary', true)
            .limit(1);
          
          // Determine status based on stock level
          let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
          if (product.stock_quantity === 0) {
            status = 'out_of_stock';
          } else if (product.stock_quantity < 10) {
            status = 'low_stock';
          }
          
          return {
            id: product.id,
            name: product.name,
            sku: `PROD-${product.id.substring(0, 6)}`,
            category_name: product.categories?.name,
            category_id: product.category_id,
            stock: product.stock_quantity,
            alert_threshold: 5, // Default alert threshold
            status,
            location: 'Main Warehouse',
            last_updated: product.updated_at,
            image: images && images.length > 0 ? images[0].url : undefined,
          };
        })
      );
      
      setInventory(inventoryWithImages);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

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
  
  const fetchInventoryLogs = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setInventoryLogs(data || []);
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      toast.error('Failed to load inventory history');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredInventory = inventory.filter(item => {
    // Filter by search term
    const searchMatch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    // Filter by category
    const categoryMatch = 
      categoryFilter === 'all' || 
      item.category_id === categoryFilter;
    
    // Filter by stock status
    let stockMatch = true;
    if (stockFilter === 'in_stock') stockMatch = item.status === 'in_stock';
    if (stockFilter === 'low_stock') stockMatch = item.status === 'low_stock';
    if (stockFilter === 'out_of_stock') stockMatch = item.status === 'out_of_stock';
    
    return searchMatch && categoryMatch && stockMatch;
  });

  const updateStock = async () => {
    if (!currentItem || !newStockValue || isNaN(Number(newStockValue))) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    const stockValue = Number(newStockValue);
    
    try {
      // Update the stock in database
      const { error } = await supabase
        .from('products')
        .update({
          stock_quantity: stockValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentItem.id);
      
      if (error) throw error;
      
      // The inventory_logs will be updated automatically through the trigger we created
      
      // Update local state
      const updatedInventory = inventory.map(item => {
        if (item.id === currentItem.id) {
          let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
          if (stockValue === 0) {
            status = 'out_of_stock';
          } else if (stockValue < 10) {
            status = 'low_stock';
          }
          
          return {
            ...item,
            stock: stockValue,
            status,
            last_updated: new Date().toISOString()
          };
        }
        return item;
      });
      
      setInventory(updatedInventory);
      setIsStockUpdateDialogOpen(false);
      setNewStockValue('');
      setUpdateReason('');
      
      toast.success(`Stock for ${currentItem.name} updated successfully to ${stockValue}`);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const openStockUpdateDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setNewStockValue(item.stock.toString());
    setIsStockUpdateDialogOpen(true);
  };

  const openHistoryModal = async (productId: string) => {
    await fetchInventoryLogs(productId);
    setIsHistoryModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'in_stock':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
            <h2 className="text-xl font-semibold">Real-time Inventory Tracking</h2>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Set Alerts
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <p className="text-2xl font-semibold">{inventory.filter(item => item.status === 'in_stock').length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full mr-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-semibold">{inventory.filter(item => item.status === 'low_stock').length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 flex items-center">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-semibold">{inventory.filter(item => item.status === 'out_of_stock').length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="w-full sm:w-auto">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-3 text-sm font-medium">Product</th>
                    <th className="p-3 text-sm font-medium">SKU</th>
                    <th className="p-3 text-sm font-medium">Category</th>
                    <th className="p-3 text-sm font-medium">Location</th>
                    <th className="p-3 text-sm font-medium">Stock</th>
                    <th className="p-3 text-sm font-medium">Status</th>
                    <th className="p-3 text-sm font-medium">Last Updated</th>
                    <th className="p-3 text-sm font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="truncate max-w-[150px]">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {item.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{item.sku}</td>
                      <td className="p-3 text-sm">{item.category_name || 'Uncategorized'}</td>
                      <td className="p-3 text-sm">{item.location || 'Main Warehouse'}</td>
                      <td className="p-3 text-sm">{item.stock}</td>
                      <td className="p-3 text-sm">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-3 text-sm">{formatDate(item.last_updated)}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openStockUpdateDialog(item)}
                            title="Update Stock"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openHistoryModal(item.id)}
                            title="View History"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-muted-foreground">
                        {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' ? 
                          'No inventory items match your filters.' :
                          'No inventory items found. Add products to see them here.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={isStockUpdateDialogOpen} onOpenChange={setIsStockUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Inventory Stock</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {currentItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock">New Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                placeholder="Enter new stock quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Update (optional)</Label>
              <Textarea
                id="reason"
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                placeholder="e.g., New inventory, Stock adjustment, etc."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={updateStock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Inventory History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory History</DialogTitle>
            <DialogDescription>
              Stock change history for this product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {inventoryLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Change</th>
                      <th className="text-left p-2">Before</th>
                      <th className="text-left p-2">After</th>
                      <th className="text-left p-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryLogs.map(log => (
                      <tr key={log.id} className="border-b">
                        <td className="p-2">{formatDate(log.created_at)}</td>
                        <td className="p-2">
                          <Badge variant={log.change_quantity > 0 ? "success" : "destructive"}>
                            {log.change_quantity > 0 ? `+${log.change_quantity}` : log.change_quantity}
                          </Badge>
                        </td>
                        <td className="p-2">{log.previous_quantity}</td>
                        <td className="p-2">{log.new_quantity}</td>
                        <td className="p-2">{log.reason || 'No reason provided'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No history found for this product.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
