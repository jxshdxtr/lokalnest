
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pencil, 
  Trash2, 
  MoreVertical, 
  ArrowUpDown, 
  Plus, 
  FileText,
  Download,
  Filter,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
interface InventoryLog {
  id: string;
  product_id: string;
  product_name: string;
  previous_quantity: number;
  new_quantity: number;
  change_quantity: number;
  reason: string;
  timestamp: string;
  staff_name: string;
}

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold?: number;
  category_name?: string;
  sku?: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);
  const [restockReason, setRestockReason] = useState<string>("");
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [productLogs, setProductLogs] = useState<InventoryLog[]>([]);

  // Mock categories - would usually come from backend
  const categories = ["Textiles", "Wooden Crafts", "Pottery", "Jewelry", "Home Decor", "Food & Beverages"];

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to use the database
      const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('*');

      if (!dbError && dbProducts && dbProducts.length > 0) {
        // Map database results to our product interface
        const mappedProducts: Product[] = dbProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          stock_quantity: product.stock_quantity || 0,
          low_stock_threshold: product.low_stock_threshold || 5,
          category_name: product.category_name || 'Uncategorized',
          sku: product.sku || `SKU-${product.id.substring(0, 6)}`,
          status: product.stock_quantity <= 0 
            ? "out_of_stock" 
            : product.stock_quantity <= (product.low_stock_threshold || 5) 
              ? "low_stock" 
              : "in_stock"
        }));
        setProducts(mappedProducts);
      } else {
        console.log('Using mock data');
        // Use mock data if database is empty or has an error
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Handwoven Cotton Tote Bag",
            stock_quantity: 26,
            low_stock_threshold: 10,
            category_name: "Textiles",
            sku: "BAG-001",
            status: "in_stock"
          },
          {
            id: "2",
            name: "Wooden Serving Bowl",
            stock_quantity: 8,
            low_stock_threshold: 10,
            category_name: "Wooden Crafts",
            sku: "BOWL-001",
            status: "low_stock"
          },
          {
            id: "3",
            name: "Ceramic Coffee Mug",
            stock_quantity: 0,
            low_stock_threshold: 5,
            category_name: "Pottery",
            sku: "MUG-001",
            status: "out_of_stock"
          },
          {
            id: "4",
            name: "Silver Earrings",
            stock_quantity: 15,
            low_stock_threshold: 5,
            category_name: "Jewelry",
            sku: "EAR-001",
            status: "in_stock"
          },
          {
            id: "5",
            name: "Bamboo Wall Decor",
            stock_quantity: 3,
            low_stock_threshold: 5,
            category_name: "Home Decor",
            sku: "DECO-001",
            status: "low_stock"
          },
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch inventory logs
  const fetchInventoryLogs = useCallback(async () => {
    try {
      // Use regular query instead of RPC to avoid TypeScript errors
      const { data, error: queryError } = await supabase
        .from('inventory_logs')
        .select('*');
      
      if (!queryError && data) {
        setLogs(data as InventoryLog[]);
      } else {
        console.error('Query error:', queryError);
        
        // Mock inventory logs
        const mockLogs: InventoryLog[] = [
          {
            id: "1",
            product_id: "1",
            product_name: "Handwoven Cotton Tote Bag",
            previous_quantity: 20,
            new_quantity: 26,
            change_quantity: 6,
            reason: "Restocking",
            timestamp: "2023-03-15T08:30:00Z",
            staff_name: "Juan Dela Cruz"
          },
          {
            id: "2",
            product_id: "2",
            product_name: "Wooden Serving Bowl",
            previous_quantity: 10,
            new_quantity: 8,
            change_quantity: -2,
            reason: "Order fulfillment",
            timestamp: "2023-03-14T14:20:00Z",
            staff_name: "Maria Santos"
          },
          {
            id: "3",
            product_id: "3",
            product_name: "Ceramic Coffee Mug",
            previous_quantity: 5,
            new_quantity: 0,
            change_quantity: -5,
            reason: "Bulk order",
            timestamp: "2023-03-13T10:15:00Z",
            staff_name: "Juan Dela Cruz"
          }
        ];
        setLogs(mockLogs);
      }
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchInventoryLogs();
  }, [fetchProducts, fetchInventoryLogs]);

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    
    try {
      const previousQuantity = selectedProduct.stock_quantity;
      const newQuantity = previousQuantity + restockQuantity;
      
      // Update locally first for immediate UI feedback
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? {
              ...p, 
              stock_quantity: newQuantity,
              status: newQuantity <= 0 
                ? "out_of_stock" 
                : newQuantity <= (p.low_stock_threshold || 5) 
                  ? "low_stock" 
                  : "in_stock"
            } 
          : p
      ));
      
      // Create new log entry
      const newLog: InventoryLog = {
        id: Date.now().toString(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        change_quantity: restockQuantity,
        reason: restockReason,
        timestamp: new Date().toISOString(),
        staff_name: "Current User" // In real app, get from auth context
      };
      
      setLogs([newLog, ...logs]);
      
      // Here you would also make an API call to update the database
      // For demo purposes we'll just show a toast
      toast.success(`Updated stock for ${selectedProduct.name}`);
      
      // Reset form and close dialog
      setRestockQuantity(0);
      setRestockReason("");
      setShowRestockDialog(false);
    } catch (error) {
      toast.error("Failed to update stock");
      console.error(error);
    }
  };
  
  const openRestockDialog = (product: Product) => {
    setSelectedProduct(product);
    setRestockQuantity(0);
    setRestockReason("");
    setShowRestockDialog(true);
  };
  
  const viewProductLogs = (productId: string) => {
    const filteredLogs = logs.filter(log => log.product_id === productId);
    setProductLogs(filteredLogs);
    setShowLogDialog(true);
  };
  
  // Filter products based on search query and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    const matchesCategory = categoryFilter === "all" || 
                            product.category_name?.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "in_stock":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>;
      case "low_stock":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead className="min-w-[250px]">Product</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Current Stock
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading inventory data...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openRestockDialog(product)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Update Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewProductLogs(product.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Restock Dialog */}
      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update inventory for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Stock:</span>
              <span>{selectedProduct?.stock_quantity}</span>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity Change
              </label>
              <Input
                id="quantity"
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                placeholder="Enter quantity change (positive or negative)"
              />
              <p className="text-sm text-muted-foreground">
                Use positive numbers to increase stock, negative to decrease
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason
              </label>
              <Select value={restockReason} onValueChange={setRestockReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for update" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Restocking">Restocking</SelectItem>
                  <SelectItem value="Damaged">Damaged/Defective</SelectItem>
                  <SelectItem value="Order fulfillment">Order fulfillment</SelectItem>
                  <SelectItem value="Inventory count">Inventory count adjustment</SelectItem>
                  <SelectItem value="Return">Customer return</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Product Log History Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Stock History</DialogTitle>
            <DialogDescription>
              {productLogs.length > 0 
                ? `Inventory changes for ${productLogs[0].product_name}`
                : "No history available"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>New Stock</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No history available for this product
                    </TableCell>
                  </TableRow>
                ) : (
                  productLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={log.change_quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {log.change_quantity > 0 ? `+${log.change_quantity}` : log.change_quantity}
                        </span>
                      </TableCell>
                      <TableCell>{log.new_quantity}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                      <TableCell>{log.staff_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
