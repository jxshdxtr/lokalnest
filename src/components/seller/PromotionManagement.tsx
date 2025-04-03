
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Tag, 
  Percent, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PromotionFormModal from './PromotionFormModal';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Define promotion interface
interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  coupon_code: string;
  start_date: string;
  end_date: string;
  minimum_purchase?: number;
  usage_limit?: number;
  usage_count: number;
  applies_to: string;
  is_active: boolean;
  created_at?: string;
}

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view promotions');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPromotions = promotions.filter(promo => 
    promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.coupon_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (promo.description && promo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleDeletePromotion = async (promoId: string) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promoId);
        
      if (error) throw error;
      
      setPromotions(promotions.filter(promo => promo.id !== promoId));
      toast.success("Promotion deleted successfully");
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };

  const handleTogglePromotion = async (promo: Promotion) => {
    try {
      // Toggle the is_active status
      const newStatus = !promo.is_active;
      
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: newStatus })
        .eq('id', promo.id);
        
      if (error) throw error;
      
      // Update local state
      setPromotions(promotions.map(p => 
        p.id === promo.id ? { ...p, is_active: newStatus } : p
      ));
      
      toast.success(newStatus ? "Promotion activated" : "Promotion disabled");
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast.error('Failed to update promotion status');
    }
  };

  const handleSavePromotion = async (promoData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to save promotions');
        return;
      }
      
      if (editingPromotion) {
        // Update existing promotion
        const { error } = await supabase
          .from('promotions')
          .update({
            title: promoData.title,
            description: promoData.description,
            discount_value: promoData.discount_value,
            discount_type: promoData.discount_type,
            start_date: promoData.start_date,
            end_date: promoData.end_date,
            is_active: promoData.is_active,
            coupon_code: promoData.coupon_code,
            minimum_purchase: promoData.minimum_purchase || 0,
            usage_limit: promoData.usage_limit,
            applies_to: promoData.applies_to,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPromotion.id);
          
        if (error) throw error;
        
        toast.success("Promotion updated successfully");
      } else {
        // Add new promotion
        const { error } = await supabase
          .from('promotions')
          .insert({
            seller_id: session.user.id,
            title: promoData.title,
            description: promoData.description,
            discount_value: promoData.discount_value,
            discount_type: promoData.discount_type,
            start_date: promoData.start_date,
            end_date: promoData.end_date,
            is_active: true,
            coupon_code: promoData.coupon_code,
            minimum_purchase: promoData.minimum_purchase || 0,
            usage_limit: promoData.usage_limit,
            usage_count: 0,
            applies_to: promoData.applies_to
          });
          
        if (error) throw error;
        
        toast.success("Promotion created successfully");
      }
      
      setIsModalOpen(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Failed to save promotion');
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);
    
    if (!promotion.is_active) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Disabled</Badge>;
    } else if (now < start) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
    } else if (now > end) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    }
  };

  const getDiscountText = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `₱${value}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <Button onClick={handleAddPromotion} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
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
                    <th className="p-3 text-sm font-medium">Promotion</th>
                    <th className="p-3 text-sm font-medium">Code</th>
                    <th className="p-3 text-sm font-medium">Discount</th>
                    <th className="p-3 text-sm font-medium">Period</th>
                    <th className="p-3 text-sm font-medium">Usage</th>
                    <th className="p-3 text-sm font-medium">Status</th>
                    <th className="p-3 text-sm font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotions.length > 0 ? (
                    filteredPromotions.map((promo) => (
                      <tr key={promo.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{promo.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {promo.description || 'No description'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono">
                            {promo.coupon_code}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            {promo.discount_type === 'percentage' ? (
                              <Percent className="h-4 w-4 mr-1 text-primary" />
                            ) : (
                              <Tag className="h-4 w-4 mr-1 text-primary" />
                            )}
                            {getDiscountText(promo.discount_type, promo.discount_value)}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center">
                            <span>
                              {promo.usage_count} {promo.usage_limit ? `/ ${promo.usage_limit}` : ''}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(promo)}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPromotion(promo)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {promo.is_active ? (
                                <DropdownMenuItem onClick={() => handleTogglePromotion(promo)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Disable
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleTogglePromotion(promo)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDeletePromotion(promo.id)}
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
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        {searchTerm ? 'No promotions match your search' : 'No promotions found. Create a new promotion to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <PromotionFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePromotion}
          promotion={editingPromotion}
        />
      )}
    </div>
  );
};

export default PromotionManagement;
