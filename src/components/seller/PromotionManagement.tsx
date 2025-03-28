
import React, { useState } from 'react';
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
  XCircle 
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

// Sample promotions data
const initialPromotions = [
  {
    id: 'promo1',
    name: 'Summer Sale',
    description: 'Get 15% off on all summer items',
    type: 'percentage',
    value: 15,
    code: 'SUMMER15',
    startDate: '2023-06-01',
    endDate: '2023-06-30',
    products: 'all',
    minimumPurchase: 1000,
    usageLimit: 100,
    usedCount: 25,
    status: 'active'
  },
  {
    id: 'promo2',
    name: 'New Customer Discount',
    description: 'Get ₱200 off on your first purchase',
    type: 'fixed',
    value: 200,
    code: 'WELCOME200',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    products: 'all',
    minimumPurchase: 1000,
    usageLimit: 1000,
    usedCount: 358,
    status: 'active'
  },
  {
    id: 'promo3',
    name: 'Wooden Crafts Special',
    description: '10% off on all wooden craft items',
    type: 'percentage',
    value: 10,
    code: 'WOOD10',
    startDate: '2023-05-15',
    endDate: '2023-07-15',
    products: 'category',
    category: 'Wooden Crafts',
    minimumPurchase: 0,
    usageLimit: 50,
    usedCount: 12,
    status: 'active'
  },
  {
    id: 'promo4',
    name: 'Holiday Sale Preview',
    description: '20% off on selected items',
    type: 'percentage',
    value: 20,
    code: 'HOLIDAY20',
    startDate: '2023-11-01',
    endDate: '2023-12-25',
    products: 'selected',
    minimumPurchase: 1500,
    usageLimit: 200,
    usedCount: 0,
    status: 'scheduled'
  },
  {
    id: 'promo5',
    name: 'Flash Sale',
    description: '25% off storewide for 24 hours only',
    type: 'percentage',
    value: 25,
    code: 'FLASH25',
    startDate: '2023-05-20',
    endDate: '2023-05-21',
    products: 'all',
    minimumPurchase: 0,
    usageLimit: 500,
    usedCount: 479,
    status: 'expired'
  }
];

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPromotions = promotions.filter(promo => 
    promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleEditPromotion = (promotion: any) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleDeletePromotion = (promoId: string) => {
    setPromotions(promotions.filter(promo => promo.id !== promoId));
    toast.success("Promotion deleted successfully");
  };

  const handleSavePromotion = (promoData: any) => {
    if (editingPromotion) {
      // Update existing promotion
      setPromotions(promotions.map(p => 
        p.id === editingPromotion.id ? { ...p, ...promoData } : p
      ));
      toast.success("Promotion updated successfully");
    } else {
      // Add new promotion
      const newPromotion = {
        id: `promo${Date.now()}`,
        ...promoData,
        usedCount: 0
      };
      setPromotions([...promotions, newPromotion]);
      toast.success("Promotion added successfully");
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string, startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Auto-determine status based on dates
    let actualStatus = status;
    if (now < start) {
      actualStatus = 'scheduled';
    } else if (now > end) {
      actualStatus = 'expired';
    }

    switch(actualStatus) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>;
      case 'disabled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                {filteredPromotions.map((promo) => (
                  <tr key={promo.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{promo.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{promo.description}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="font-mono">
                        {promo.code}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {promo.type === 'percentage' ? (
                          <Percent className="h-4 w-4 mr-1 text-primary" />
                        ) : (
                          <Tag className="h-4 w-4 mr-1 text-primary" />
                        )}
                        {getDiscountText(promo.type, promo.value)}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center">
                        <span>{promo.usedCount} / {promo.usageLimit}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(promo.status, promo.startDate, promo.endDate)}
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
                          {promo.status === 'active' && (
                            <DropdownMenuItem onClick={() => {
                              setPromotions(promotions.map(p => 
                                p.id === promo.id ? { ...p, status: 'disabled' } : p
                              ));
                              toast.success("Promotion disabled");
                            }}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Disable
                            </DropdownMenuItem>
                          )}
                          {promo.status === 'disabled' && (
                            <DropdownMenuItem onClick={() => {
                              setPromotions(promotions.map(p => 
                                p.id === promo.id ? { ...p, status: 'active' } : p
                              ));
                              toast.success("Promotion activated");
                            }}>
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
                ))}
                {filteredPromotions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No promotions found. Create a new promotion to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
