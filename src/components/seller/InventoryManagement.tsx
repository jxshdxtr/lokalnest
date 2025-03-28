
import React, { useState } from 'react';
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
  ShoppingBag
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

// Sample inventory data
const initialInventory = [
  {
    id: 'prod1',
    name: 'Handwoven Cotton Tote Bag',
    sku: 'TOT-001',
    category: 'Textiles & Clothing',
    stock: 15,
    alert_threshold: 5,
    status: 'in_stock',
    location: 'Warehouse A',
    last_updated: '2023-06-15',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80'
  },
  {
    id: 'prod2',
    name: 'Handcrafted Wooden Serving Bowl',
    sku: 'BOWL-002',
    category: 'Wooden Crafts',
    stock: 8,
    alert_threshold: 3,
    status: 'in_stock',
    location: 'Warehouse A',
    last_updated: '2023-06-14',
    image: 'https://images.unsplash.com/photo-1635995158887-316c704fa35d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80'
  },
  {
    id: 'prod3',
    name: 'Hand-painted Ceramic Mug',
    sku: 'MUG-003',
    category: 'Pottery & Ceramics',
    stock: 22,
    alert_threshold: 10,
    status: 'in_stock',
    location: 'Warehouse B',
    last_updated: '2023-06-14',
    image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80'
  },
  {
    id: 'prod4',
    name: 'Handcrafted Silver Earrings',
    sku: 'EAR-004',
    category: 'Jewelry & Accessories',
    stock: 5,
    alert_threshold: 5,
    status: 'low_stock',
    location: 'Warehouse A',
    last_updated: '2023-06-13',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80'
  },
  {
    id: 'prod5',
    name: 'Handwoven Bamboo Wall Hanging',
    sku: 'DECO-005',
    category: 'Home Decor',
    stock: 0,
    alert_threshold: 2,
    status: 'out_of_stock',
    location: 'Warehouse B',
    last_updated: '2023-06-12',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80'
  },
  {
    id: 'prod6',
    name: 'Artisanal Coconut Jam Set',
    sku: 'FOOD-006',
    category: 'Food & Beverages',
    stock: 12,
    alert_threshold: 8,
    status: 'in_stock',
    location: 'Warehouse C',
    last_updated: '2023-06-10',
    image: 'https://images.unsplash.com/photo-1612200482741-3ad34fcd2eb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80'
  }
];

const InventoryManagement = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [updateReason, setUpdateReason] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredInventory = inventory.filter(item => {
    // Filter by search term
    const searchMatch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    
    // Filter by stock status
    let stockMatch = true;
    if (stockFilter === 'in_stock') stockMatch = item.status === 'in_stock';
    if (stockFilter === 'low_stock') stockMatch = item.status === 'low_stock';
    if (stockFilter === 'out_of_stock') stockMatch = item.status === 'out_of_stock';
    
    return searchMatch && categoryMatch && stockMatch;
  });

  const updateStock = () => {
    if (!currentItem || !newStockValue || isNaN(Number(newStockValue))) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    const stockValue = Number(newStockValue);
    
    // Update the stock and status
    const updatedInventory = inventory.map(item => {
      if (item.id === currentItem.id) {
        const status = stockValue === 0 ? 'out_of_stock' : 
                      stockValue <= item.alert_threshold ? 'low_stock' : 'in_stock';
        
        return {
          ...item,
          stock: stockValue,
          status: status,
          last_updated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    
    setInventory(updatedInventory);
    setIsStockUpdateDialogOpen(false);
    setNewStockValue('');
    setUpdateReason('');
    
    toast.success(`Stock for ${currentItem.name} updated successfully to ${stockValue}`);
  };

  const openStockUpdateDialog = (item: any) => {
    setCurrentItem(item);
    setNewStockValue(item.stock.toString());
    setIsStockUpdateDialogOpen(true);
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

  const getUniqueCategories = () => {
    const categories = inventory.map(item => item.category);
    return ['all', ...new Set(categories)];
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
                  {getUniqueCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
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
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="truncate max-w-[150px]">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{item.sku}</td>
                    <td className="p-3 text-sm">{item.category}</td>
                    <td className="p-3 text-sm">{item.location}</td>
                    <td className="p-3 text-sm font-medium">{item.stock}</td>
                    <td className="p-3 text-sm">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-3 text-sm">{item.last_updated}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openStockUpdateDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <History className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Stock History</h4>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Mock historical data would appear here</p>
                                <ul className="mt-2 space-y-1">
                                  <li className="text-xs">2023-06-15: Stock updated to 15</li>
                                  <li className="text-xs">2023-06-10: Stock updated to 18</li>
                                  <li className="text-xs">2023-06-05: Stock updated to 20</li>
                                </ul>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      No inventory items found. Try adjusting your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isStockUpdateDialogOpen} onOpenChange={setIsStockUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>
              Enter the new stock quantity for {currentItem?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="stock" className="text-right">
                Current Stock
              </label>
              <Input
                id="current-stock"
                value={currentItem?.stock}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="stock" className="text-right">
                New Stock
              </label>
              <Input
                id="stock"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                type="number"
                min="0"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="reason" className="text-right">
                Reason
              </label>
              <Select value={updateReason} onValueChange={setUpdateReason}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select reason for update" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_stock">New Stock Arrived</SelectItem>
                  <SelectItem value="sold">Items Sold</SelectItem>
                  <SelectItem value="damaged">Items Damaged</SelectItem>
                  <SelectItem value="correction">Inventory Correction</SelectItem>
                  <SelectItem value="returned">Customer Returns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateStock}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
