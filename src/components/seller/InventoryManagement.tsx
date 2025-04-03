import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { Loader2, Plus, Edit, CheckCheck, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/integrations/supabase/client';

// Types for inventory management
interface InventoryLog {
  id: string;
  product_id: string;
  product_name: string;
  previous_quantity: number;
  new_quantity: number;
  change_quantity: number;
  reason: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

const stockUpdateSchema = z.object({
  productId: z.string().uuid(),
  newQuantity: z.number().int().min(0, { message: "Quantity must be at least 0" }),
  reason: z.string().min(3, { message: "Reason must be at least 3 characters" }),
});

const InventoryManagement = () => {
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [updateStockOpen, setUpdateStockOpen] = useState(false);

  const form = useForm<z.infer<typeof stockUpdateSchema>>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      productId: '',
      newQuantity: 0,
      reason: '',
    },
  });

  const fetchInventoryLogs = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view inventory logs');
        return;
      }
      
      // Use the RPC function instead of direct table access
      const { data, error } = await supabase.rpc(
        'get_inventory_logs',
        { seller_id_param: session.user.id }
      );
      
      if (error) {
        console.error('Error fetching inventory logs:', error);
        setInventoryLogs([]);
        return;
      }
      
      setInventoryLogs(data || []);
    } catch (error) {
      console.error('Error in fetchInventoryLogs:', error);
      toast.error('Failed to load inventory logs');
      setInventoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view products');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('seller_id', session.user.id);

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    }
  };

  const updateProductStock = async (values: { 
    productId: string; 
    newQuantity: number; 
    reason: string;
  }) => {
    setUpdatingStock(true);
    
    try {
      const { error } = await supabase.rpc(
        'update_product_stock',
        {
          product_id_param: values.productId,
          new_quantity_param: values.newQuantity,
          reason_param: values.reason
        }
      );
      
      if (error) throw error;
      
      toast.success('Stock updated successfully');
      fetchProducts();
      fetchInventoryLogs();
      form.reset();
      setUpdateStockOpen(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setUpdatingStock(false);
    }
  };

  useEffect(() => {
    fetchInventoryLogs();
    fetchProducts();
  }, []);

  const getChangeVariant = (change: number) => {
    if (change > 0) {
      return "default";
    } else if (change < 0) {
      return "destructive";
    } else {
      return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Track and manage your product inventory levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A comprehensive list of inventory logs.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Product</TableHead>
                <TableHead>Previous Quantity</TableHead>
                <TableHead>New Quantity</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading inventory logs...
                  </TableCell>
                </TableRow>
              ) : inventoryLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No inventory logs found.
                  </TableCell>
                </TableRow>
              ) : (
                inventoryLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.product_name}</TableCell>
                    <TableCell>{log.previous_quantity}</TableCell>
                    <TableCell>{log.new_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={getChangeVariant(log.change_quantity)}>
                        {log.change_quantity > 0 ? "+" : ""}
                        {log.change_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.reason}</TableCell>
                    <TableCell>{log.created_by_name}</TableCell>
                    <TableCell>
                      {new Date(log.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7}>
                  <Dialog open={updateStockOpen} onOpenChange={setUpdateStockOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Stock
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Product Stock</DialogTitle>
                        <DialogDescription>
                          Make changes to your product stock levels.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(updateProductStock)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="productId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product</FormLabel>
                                <FormControl>
                                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field}>
                                    <option value="">Select a product</option>
                                    {products.map((product) => (
                                      <option key={product.id} value={product.id}>
                                        {product.name}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="newQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Quantity</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter new quantity" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reason</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter reason for stock update" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={updatingStock}>
                            {updatingStock ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Update Stock
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
