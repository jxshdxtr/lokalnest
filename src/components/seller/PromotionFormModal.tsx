
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Tag, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  promotion?: any;
}

const PromotionFormModal: React.FC<PromotionFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  promotion 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    coupon_code: '',
    start_date: '',
    end_date: '',
    applies_to: 'all',
    category: '',
    minimum_purchase: '',
    usage_limit: '',
    is_active: true
  });

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    
    // Load promotion data if editing
    if (promotion) {
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        discount_type: promotion.discount_type || 'percentage',
        discount_value: promotion.discount_value?.toString() || '',
        coupon_code: promotion.coupon_code || '',
        start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : '',
        end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : '',
        applies_to: promotion.applies_to || 'all',
        category: promotion.category || '',
        minimum_purchase: promotion.minimum_purchase?.toString() || '',
        usage_limit: promotion.usage_limit?.toString() || '',
        is_active: promotion.is_active !== undefined ? promotion.is_active : true
      });
    } else {
      // Default values for new promotion
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData({
        ...formData,
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0]
      });
    }
  }, [promotion]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.discount_value || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to create promotions');
        return;
      }
      
      // Parse numeric values
      const promoData = {
        title: formData.title,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        coupon_code: formData.coupon_code,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        applies_to: formData.applies_to,
        seller_id: session.user.id,
        minimum_purchase: formData.minimum_purchase ? parseFloat(formData.minimum_purchase) : 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        is_active: formData.is_active
      };
      
      if (promotion) {
        // Update existing promotion
        const { error } = await supabase
          .from('promotions')
          .update(promoData)
          .eq('id', promotion.id);
          
        if (error) throw error;
        toast.success('Promotion updated successfully');
      } else {
        // Create new promotion
        const { error } = await supabase
          .from('promotions')
          .insert(promoData);
          
        if (error) throw error;
        toast.success('Promotion created successfully');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Failed to save promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[675px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Promotion Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Promotion Name <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter promotion name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your promotion..."
                rows={2}
              />
            </div>
          </div>
          
          {/* Discount Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Discount Information</h3>
            
            <div className="space-y-2">
              <Label>Discount Type <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={formData.discount_type} 
                onValueChange={(value) => handleSelectChange(value, 'discount_type')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label htmlFor="percentage" className="flex items-center cursor-pointer">
                    <Percent className="h-4 w-4 mr-1" />
                    Percentage Discount
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="flex items-center cursor-pointer">
                    <Tag className="h-4 w-4 mr-1" />
                    Fixed Amount Discount
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_value">Discount Value <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {formData.discount_type === 'percentage' ? (
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="text-muted-foreground">₱</span>
                    )}
                  </div>
                  <Input
                    id="discount_value"
                    name="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={handleChange}
                    placeholder={formData.discount_type === 'percentage' ? "10" : "100"}
                    className="pl-10"
                    min="0"
                    max={formData.discount_type === 'percentage' ? "100" : undefined}
                    step={formData.discount_type === 'percentage' ? "1" : "0.01"}
                    required
                  />
                </div>
                {formData.discount_type === 'percentage' && (
                  <p className="text-xs text-muted-foreground">Enter a percentage value (0-100)</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coupon_code">Promotion Code</Label>
                <Input
                  id="coupon_code"
                  name="coupon_code"
                  value={formData.coupon_code}
                  onChange={handleChange}
                  placeholder="SUMMER2023"
                  className="uppercase"
                />
              </div>
            </div>
          </div>
          
          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Promotion Period</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date <span className="text-red-500">*</span></Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Applicable Products */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Applicable Products</h3>
            
            <div className="space-y-2">
              <Label>Apply Discount To</Label>
              <RadioGroup 
                value={formData.applies_to} 
                onValueChange={(value) => handleSelectChange(value, 'applies_to')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">All Products</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific_categories" id="specific_categories" />
                  <Label htmlFor="specific_categories" className="cursor-pointer">Specific Category</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific_products" id="specific_products" />
                  <Label htmlFor="specific_products" className="cursor-pointer">Selected Products</Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.applies_to === 'specific_categories' && (
              <div className="space-y-2">
                <Label htmlFor="category">Select Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange(value, 'category')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formData.applies_to === 'specific_products' && (
              <div className="p-4 border border-dashed rounded-md border-muted-foreground/30 text-center">
                <p className="text-sm text-muted-foreground">
                  Product selection will be available after creating the promotion.
                </p>
              </div>
            )}
          </div>
          
          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Additional Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum_purchase">Minimum Purchase Amount (₱)</Label>
                <Input
                  id="minimum_purchase"
                  name="minimum_purchase"
                  type="number"
                  value={formData.minimum_purchase}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">Leave blank or set to 0 for no minimum</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  id="usage_limit"
                  name="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">Maximum number of times this code can be used</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Fields marked with <span className="text-red-500">*</span> are required. Promotions will automatically become active on the start date and expire on the end date.
            </p>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : promotion ? 'Update Promotion' : 'Create Promotion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionFormModal;
