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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarIcon, CheckCircle, Copy, Edit, Plus, Save, Trash2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Types for promotion management
interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  coupon_code: string;
  start_date: string;
  end_date: string;
  minimum_purchase: number;
  usage_limit: number | null;
  usage_count: number;
  applies_to: string;
  is_active: boolean;
  created_at: string;
}

// Form validation schema
const promotionSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  discount_value: z.number({ invalid_type_error: 'Discount value must be a number.' }).min(0, { message: 'Discount value must be non-negative.' }),
  discount_type: z.enum(['percentage', 'fixed']),
  coupon_code: z.string().min(5, { message: 'Coupon code must be at least 5 characters.' }),
  start_date: z.date({ required_error: 'Start date is required.' }),
  end_date: z.date({ required_error: 'End date is required.' }),
  minimum_purchase: z.number({ invalid_type_error: 'Minimum purchase must be a number.' }).optional(),
  usage_limit: z.number({ invalid_type_error: 'Usage limit must be a number.' }).optional(),
  applies_to: z.string().optional(),
  is_active: z.boolean().default(true),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: '',
      description: '',
      discount_value: 0,
      discount_type: 'percentage',
      coupon_code: '',
      start_date: new Date(),
      end_date: new Date(),
      minimum_purchase: 0,
      usage_limit: null,
      applies_to: 'all',
      is_active: true,
    },
  });

  const { setValue } = form;

  // Modified fetchPromotions function to use RPC
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view promotions');
        return;
      }
      
      // Use the RPC function instead of direct table access
      const { data, error } = await supabase.rpc(
        'get_seller_promotions',
        { seller_id_param: session.user.id }
      );
      
      if (error) throw error;
      
      // Convert date strings to Date objects for the form
      setPromotions((data || []).map((promo: any) => ({
        ...promo,
        start_date: new Date(promo.start_date).toLocaleDateString(),
        end_date: new Date(promo.end_date).toLocaleDateString(),
      })));
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const onOpenChange = () => {
    setIsModalOpen(true);
    setSelectedPromotion(null);
    form.reset();
  };

  const editPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);

    // Set form values
    setValue('title', promotion.title);
    setValue('description', promotion.description || '');
    setValue('discount_value', promotion.discount_value);
    setValue('discount_type', promotion.discount_type);
    setValue('coupon_code', promotion.coupon_code);
    setValue('start_date', new Date(promotion.start_date));
    setValue('end_date', new Date(promotion.end_date));
    setValue('minimum_purchase', promotion.minimum_purchase || 0);
    setValue('usage_limit', promotion.usage_limit || null);
    setValue('applies_to', promotion.applies_to || 'all');
    setValue('is_active', promotion.is_active);
  };
  
  // Modified createPromotion function to use RPC
  const createPromotion = async (data: any) => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to create a promotion');
        return;
      }
      
      // Format dates for the database
      const startDate = new Date(data.start_date).toISOString();
      const endDate = new Date(data.end_date).toISOString();
      
      // Use the RPC function instead of direct table access
      const { error } = await supabase.rpc(
        'create_promotion',
        {
          seller_id_param: session.user.id,
          title_param: data.title,
          description_param: data.description || '',
          discount_value_param: data.discount_value,
          discount_type_param: data.discount_type,
          start_date_param: startDate,
          end_date_param: endDate,
          coupon_code_param: data.coupon_code,
          minimum_purchase_param: data.minimum_purchase || 0,
          usage_limit_param: data.usage_limit || null,
          applies_to_param: data.applies_to || 'all'
        }
      );
      
      if (error) throw error;
      
      toast.success('Promotion created successfully');
      setIsModalOpen(false);
      form.reset();
      fetchPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Modified updatePromotion function to use RPC
  const updatePromotion = async (data: any) => {
    if (!selectedPromotion) return;
    
    setSubmitting(true);
    try {
      // Format dates for the database
      const startDate = new Date(data.start_date).toISOString();
      const endDate = new Date(data.end_date).toISOString();
      
      // Use the RPC function instead of direct table access
      const { error } = await supabase.rpc(
        'update_promotion',
        {
          promotion_id_param: selectedPromotion.id,
          title_param: data.title,
          description_param: data.description || '',
          discount_value_param: data.discount_value,
          discount_type_param: data.discount_type,
          start_date_param: startDate,
          end_date_param: endDate,
          is_active_param: data.is_active,
          coupon_code_param: data.coupon_code,
          minimum_purchase_param: data.minimum_purchase || 0,
          usage_limit_param: data.usage_limit || null,
          applies_to_param: data.applies_to || 'all'
        }
      );
      
      if (error) throw error;
      
      toast.success('Promotion updated successfully');
      setIsModalOpen(false);
      form.reset();
      fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast.error('Failed to update promotion');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Modified togglePromotionStatus function to use RPC
  const togglePromotionStatus = async (promotionId: string, isActive: boolean) => {
    try {
      // Use the RPC function instead of direct table access
      const { error } = await supabase.rpc(
        'update_promotion_status',
        {
          promotion_id_param: promotionId,
          is_active_param: !isActive
        }
      );
      
      if (error) throw error;
      
      toast.success(`Promotion ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      toast.error('Failed to update promotion status');
    }
  };
  
  // Modified deletePromotion function to use RPC
  const deletePromotion = async (promotionId: string) => {
    try {
      // Use the RPC function instead of direct table access
      const { error } = await supabase.rpc(
        'delete_promotion',
        {
          promotion_id_param: promotionId
        }
      );
      
      if (error) throw error;
      
      toast.success('Promotion deleted successfully');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };
  
  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Promotions</CardTitle>
          <CardDescription>
            Manage your active and upcoming promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={onOpenChange}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Promotion
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{selectedPromotion ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
                    <DialogDescription>
                      {selectedPromotion ? 'Update the promotion details.' : 'Create a new promotion.'}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(selectedPromotion ? updatePromotion : createPromotion)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Promotion Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Promotion Description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="discount_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Value</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Discount Value" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="discount_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select discount type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                  <SelectItem value="fixed">Fixed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="coupon_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coupon Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Coupon Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date()
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date() || date < form.getValues('start_date')
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="minimum_purchase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Purchase</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Minimum Purchase" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="usage_limit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usage Limit</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Usage Limit" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="applies_to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Applies To</FormLabel>
                            <FormControl>
                              <Input placeholder="Applies To" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {selectedPromotion && (
                        <FormField
                          control={form.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                  Set promotion as active or inactive.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Save className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {selectedPromotion ? 'Update' : 'Create'}
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                Loading promotions...
              </div>
            ) : (
              <Table>
                <TableCaption>A list of your promotions.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>{promotion.title}</TableCell>
                      <TableCell>{promotion.coupon_code}</TableCell>
                      <TableCell>{promotion.discount_value} {promotion.discount_type === 'percentage' ? '%' : 'fixed'}</TableCell>
                      <TableCell>{promotion.start_date}</TableCell>
                      <TableCell>{promotion.end_date}</TableCell>
                      <TableCell>
                        {promotion.is_active ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editPromotion(promotion)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => togglePromotionStatus(promotion.id, promotion.is_active)}>
                            {promotion.is_active ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deletePromotion(promotion.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionManagement;
