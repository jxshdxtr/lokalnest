
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

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promoData: any) => void;
  promotion?: any;
}

const PromotionFormModal: React.FC<PromotionFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  promotion 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    code: '',
    startDate: '',
    endDate: '',
    products: 'all',
    category: '',
    minimumPurchase: '',
    usageLimit: '',
    status: 'active'
  });

  // Load promotion data if editing
  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || '',
        description: promotion.description || '',
        type: promotion.type || 'percentage',
        value: promotion.value?.toString() || '',
        code: promotion.code || '',
        startDate: promotion.startDate || '',
        endDate: promotion.endDate || '',
        products: promotion.products || 'all',
        category: promotion.category || '',
        minimumPurchase: promotion.minimumPurchase?.toString() || '',
        usageLimit: promotion.usageLimit?.toString() || '',
        status: promotion.status || 'active'
      });
    } else {
      // Default values for new promotion
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData({
        ...formData,
        startDate: today.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0]
      });
    }
  }, [promotion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.value || !formData.code || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Parse numeric values
    const promoData = {
      ...formData,
      value: parseFloat(formData.value),
      minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : 0
    };
    
    onSave(promoData);
  };
  
  const categories = [
    "Textiles & Clothing",
    "Wooden Crafts",
    "Pottery & Ceramics",
    "Jewelry & Accessories",
    "Home Decor",
    "Food & Beverages",
    "Art & Paintings",
    "Soaps & Cosmetics",
    "Basket Weaving",
    "Other Crafts"
  ];

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
              <Label htmlFor="name">Promotion Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
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
                value={formData.type} 
                onValueChange={(value) => handleSelectChange(value, 'type')}
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
                <Label htmlFor="value">Discount Value <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {formData.type === 'percentage' ? (
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="text-muted-foreground">₱</span>
                    )}
                  </div>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder={formData.type === 'percentage' ? "10" : "100"}
                    className="pl-10"
                    min="0"
                    max={formData.type === 'percentage' ? "100" : undefined}
                    step={formData.type === 'percentage' ? "1" : "0.01"}
                    required
                  />
                </div>
                {formData.type === 'percentage' && (
                  <p className="text-xs text-muted-foreground">Enter a percentage value (0-100)</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Promotion Code <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="SUMMER2023"
                  className="uppercase"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Promotion Period</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
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
                value={formData.products} 
                onValueChange={(value) => handleSelectChange(value, 'products')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">All Products</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="category" id="category" />
                  <Label htmlFor="category" className="cursor-pointer">Specific Category</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <Label htmlFor="selected" className="cursor-pointer">Selected Products</Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.products === 'category' && (
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
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formData.products === 'selected' && (
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
                <Label htmlFor="minimumPurchase">Minimum Purchase Amount (₱)</Label>
                <Input
                  id="minimumPurchase"
                  name="minimumPurchase"
                  type="number"
                  value={formData.minimumPurchase}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">Leave blank or set to 0 for no minimum</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  value={formData.usageLimit}
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{promotion ? 'Update Promotion' : 'Create Promotion'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionFormModal;
