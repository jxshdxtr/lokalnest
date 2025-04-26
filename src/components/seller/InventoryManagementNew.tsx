import React, { useState, useEffect, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  FileText,
  Pencil,
  Trash2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSellerVerification } from "@/hooks/use-seller-verification";
import VerificationBanner from "./VerificationBanner";

// Types
interface InventoryLog {
  id: string;
  product_id: string;
  product_name: string;
  product_category: string;
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

const InventoryManagementNew: React.FC = () => {
  // Use the verification hook
  const { 
    isVerified, 
    isLoading: verificationLoading, 
    sellerId, 
    verificationStatus 
  } = useSellerVerification();

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
    if (!sellerId) return;
    
    // If not verified, don't fetch real data
    if (!isVerified) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Try to use the database
      const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('*, categories:category_id(id, name)')
        .eq('seller_id', sellerId);

      if (!dbError && dbProducts && dbProducts.length > 0) {
        // Filter to ensure products belong to this seller only
        const filteredProducts = dbProducts.filter(product => product.seller_id === sellerId);
        
        // Map database results to our product interface
        const mappedProducts: Product[] = filteredProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          stock_quantity: product.stock_quantity || 0,
          low_stock_threshold: product.low_stock_threshold || 5,
          category_name: product.categories?.name || 'Uncategorized',
          sku: product.sku || `SKU-${product.id.substring(0, 6)}`,
          status: product.stock_quantity <= 0 
            ? "out_of_stock" 
            : product.stock_quantity <= (product.low_stock_threshold || 5) 
              ? "low_stock" 
              : "in_stock"
        }));
        
        setProducts(mappedProducts);
      } else {
        console.log('No products found or DB error, using empty array');
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  }, [sellerId, isVerified]);

  // Fetch inventory logs
  const fetchInventoryLogs = useCallback(async () => {
    if (!sellerId || !isVerified) {
      setLogs([]);
      return;
    }
    
    try {
      // Use regular query instead of RPC to avoid TypeScript errors
      const { data, error: queryError } = await supabase
        .from('inventory_logs')
        .select('*, products:product_id(name, category_id, seller_id, categories:category_id(name))')
        .eq('products.seller_id', sellerId);
      
      if (!queryError && data) {
        // Filter logs to ensure they belong to this seller's products
        const filteredLogs = data.filter(log => log.products?.seller_id === sellerId);
        
        // Map logs to our type
        const mappedLogs: InventoryLog[] = filteredLogs.map(log => ({
          id: log.id,
          product_id: log.product_id,
          product_name: log.products ? log.products.name : 'Unknown Product',
          product_category: log.products?.categories ? log.products.categories.name : 'Uncategorized',
          previous_quantity: log.previous_quantity || 0,
          new_quantity: log.new_quantity || 0,
          change_quantity: log.change_quantity || 0,
          reason: log.reason || 'No reason provided',
          timestamp: log.created_at || new Date().toISOString(),
          staff_name: log.created_by ? log.created_by : 'System'
        }));
        
        setLogs(mappedLogs);
      } else {
        console.log('No logs found or DB error, using empty array');
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
      toast.error("Failed to load inventory logs");
    }
  }, [sellerId, isVerified]);

  // Initial fetch
  useEffect(() => {
    // Only fetch data if the seller is verified
    if (isVerified && sellerId) {
      fetchProducts();
      fetchInventoryLogs();
    }
  }, [fetchProducts, fetchInventoryLogs, isVerified, sellerId]);

  const handleUpdateStock = async () => {
    if (!selectedProduct || !isVerified) return;
    
    try {
      const previousQuantity = selectedProduct.stock_quantity;
      const newQuantity = previousQuantity + restockQuantity;
      
      // Update product stock in the database
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newQuantity 
        })
        .eq('id', selectedProduct.id);
        
      if (updateError) throw updateError;
      
      // Create inventory log entry in the database
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: selectedProduct.id,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          change_quantity: restockQuantity,
          reason: restockReason,
          created_at: new Date().toISOString(),
          created_by: sellerId  // Using created_by instead of staff_id
        });
        
      if (logError) throw logError;
      
      // Update locally for immediate UI feedback
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
      
      // Create new log entry for the UI
      const newLog: InventoryLog = {
        id: Date.now().toString(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_category: selectedProduct.category_name || 'Uncategorized',
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        change_quantity: restockQuantity,
        reason: restockReason,
        timestamp: new Date().toISOString(),
        staff_name: "Current User" // In real app, get from auth context
      };
      
      setLogs([newLog, ...logs]);
      
      // Check if stock is now low and notify if needed
      if (newQuantity > 0 && newQuantity <= (selectedProduct.low_stock_threshold || 5)) {
        createLowStockNotification(
          sellerId, 
          selectedProduct.id, 
          selectedProduct.name, 
          newQuantity, 
          selectedProduct.low_stock_threshold || 5
        );
      }
      
      toast.success(`Updated stock for ${selectedProduct.name}`);
      
      // Reset form and close dialog
      setRestockQuantity(0);
      setRestockReason("");
      setShowRestockDialog(false);
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast.error("Failed to update stock");
    }
  };
  
  // Create low stock notification
  const createLowStockNotification = async (
    sellerId: string,
    productId: string,
    productName: string,
    currentStock: number,
    threshold: number
  ) => {
    try {
      console.log('Creating low stock notification for seller:', sellerId);
      
      // Use the RPC function to create notification (respects user preferences)
      const { data, error } = await (supabase.rpc as any)('create_user_notification', {
        p_user_id: sellerId,
        p_type: 'low_stock',
        p_title: `Low Stock Alert: ${productName}`,
        p_message: `Your product "${productName}" is running low on stock. Current quantity: ${currentStock} (threshold: ${threshold})`,
        p_data: JSON.stringify({
          product_id: productId,
          current_stock: currentStock,
          threshold: threshold
        }),
        p_preference_key: 'stock_alerts'
      });

      if (error) {
        console.error('Error creating low stock notification:', error);
        return;
      }
      
      if (data === null) {
        console.log('Notification not created - seller has disabled stock alerts');
      } else {
        console.log('Low stock notification created successfully with ID:', data);
      }
    } catch (error) {
      console.error('Exception in createLowStockNotification:', error);
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

  // If verification is loading, show loading state
  if (verificationLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory management...</p>
        </div>
      </div>
    );
  }

  // Show the verification banner if the seller is not verified
  if (!isVerified && verificationStatus) {
    return (
      <div className="space-y-6">
        <VerificationBanner 
          status={verificationStatus} 
          message="To manage inventory and list products, you need to verify your seller account."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="inventory">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[250px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-auto sm:w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-auto sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="inventory" className="mt-0">
          <Card>
            <CardHeader className="bg-muted/50">
              <h2 className="text-lg font-medium">Product Inventory</h2>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Stock</TableHead>
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
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-0">
          <Card>
            <CardHeader className="bg-muted/50">
              <h2 className="text-lg font-medium">Inventory Activity Logs</h2>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No inventory activity logs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{log.product_name}</TableCell>
                          <TableCell className={log.change_quantity > 0 ? "text-green-600" : "text-red-600"}>
                            {log.change_quantity > 0 ? "+" : ""}{log.change_quantity}
                          </TableCell>
                          <TableCell>{log.new_quantity}</TableCell>
                          <TableCell>{log.product_category}</TableCell>
                          <TableCell>{log.reason}</TableCell>
                          <TableCell>{log.staff_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
                  <TableHead>Category</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No history found for this product
                    </TableCell>
                  </TableRow>
                ) : (
                  productLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={log.change_quantity > 0 ? "text-green-600" : "text-red-600"}>
                        {log.change_quantity > 0 ? "+" : ""}{log.change_quantity}
                      </TableCell>
                      <TableCell>{log.new_quantity}</TableCell>
                      <TableCell>{log.product_category}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                      <TableCell>{log.staff_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagementNew;