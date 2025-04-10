
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Copy, Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PromotionFormModal from "./PromotionFormModal";

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  coupon_code?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  minimum_purchase?: number;
  products?: string[];
  seller_id?: string;
}

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('You must be logged in to view promotions');
        return;
      }
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('seller_id', sessionData.session.user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const mappedPromotions: Promotion[] = data.map((promo: any) => ({
          id: promo.id,
          title: promo.title,
          description: promo.description || '',
          discount_type: promo.discount_type as "percentage" | "fixed",
          discount_value: promo.discount_value,
          coupon_code: promo.coupon_code,
          start_date: promo.start_date,
          end_date: promo.end_date,
          is_active: promo.is_active !== null ? promo.is_active : true,
          usage_limit: promo.usage_limit,
          usage_count: promo.usage_count || 0,
          minimum_purchase: promo.minimum_purchase,
          products: promo.applies_to === 'specific' ? [] : undefined,
          seller_id: promo.seller_id
        }));
        
        setPromotions(mappedPromotions);
      } else {
        // Use mock data only if no data from database
        const mockPromotions: Promotion[] = [
          {
            id: "1",
            title: "Summer Sale",
            description: "20% discount on all summer products",
            discount_type: "percentage",
            discount_value: 20,
            start_date: "2025-06-01T00:00:00Z",
            end_date: "2025-08-31T23:59:59Z",
            is_active: true,
            usage_count: 45,
            usage_limit: 100,
            minimum_purchase: 500
          },
          {
            id: "2",
            title: "New Customer Discount",
            description: "₱200 off for new customers",
            discount_type: "fixed",
            discount_value: 200,
            coupon_code: "WELCOME200",
            start_date: "2025-04-01T00:00:00Z",
            end_date: "2025-12-31T23:59:59Z",
            is_active: true,
            usage_count: 78,
            usage_limit: 500,
            minimum_purchase: 1000
          },
          {
            id: "3",
            title: "Holiday Special",
            description: "15% off on all products during the holiday season",
            discount_type: "percentage",
            discount_value: 15,
            start_date: "2025-12-01T00:00:00Z",
            end_date: "2025-12-31T23:59:59Z",
            is_active: false,
            usage_count: 0,
            products: ["1", "2", "5"]
          },
          {
            id: "4",
            title: "Loyalty Reward",
            description: "10% discount for returning customers",
            discount_type: "percentage",
            discount_value: 10,
            coupon_code: "LOYAL10",
            start_date: "2025-03-15T00:00:00Z",
            end_date: "2025-09-15T23:59:59Z",
            is_active: true,
            usage_count: 23,
            minimum_purchase: 800
          }
        ];
        setPromotions(data && data.length === 0 ? [] : mockPromotions);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      setPromotions(promotions.map(promo => 
        promo.id === id ? {...promo, is_active: !currentState} : promo
      ));
      
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !currentState })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Promotion ${!currentState ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error updating promotion status:", error);
      toast.error("Failed to update promotion");
      
      setPromotions(promotions.map(promo => 
        promo.id === id ? {...promo, is_active: currentState} : promo
      ));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  const handleDeletePromotion = async () => {
    if (!currentPromotion) return;
    
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', currentPromotion.id);
        
      if (error) throw error;
      
      setPromotions(promotions.filter(promo => promo.id !== currentPromotion.id));
      setIsDeleteDialogOpen(false);
      setCurrentPromotion(null);
      toast.success("Promotion deleted successfully");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion");
    }
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setIsFormModalOpen(true);
  };

  const handleCreateNewPromotion = () => {
    setCurrentPromotion(null);
    setIsFormModalOpen(true);
  };

  const handleDuplicatePromotion = (promotion: Promotion) => {
    const duplicatedPromotion = {
      ...promotion,
      id: undefined, // Remove ID so a new one is generated
      title: `${promotion.title} (Copy)`,
      usage_count: 0 // Reset usage count
    };
    
    setCurrentPromotion(duplicatedPromotion as Promotion);
    setIsFormModalOpen(true);
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         promotion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (promotion.coupon_code && 
                          promotion.coupon_code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesTab = true;
    if (activeTab === "active") {
      matchesTab = promotion.is_active;
    } else if (activeTab === "inactive") {
      matchesTab = !promotion.is_active;
    } else if (activeTab === "scheduled") {
      const now = new Date();
      const startDate = new Date(promotion.start_date);
      matchesTab = startDate > now && promotion.is_active;
    }
    
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const isScheduled = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    return start > now;
  };

  const isExpired = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    return end < now;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Promotions &amp; Discounts</h1>
        <Button onClick={handleCreateNewPromotion}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>
      
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search promotions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion</TableHead>
              <TableHead className="hidden md:table-cell">Discount</TableHead>
              <TableHead className="hidden md:table-cell">Valid Period</TableHead>
              <TableHead className="hidden md:table-cell">Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading promotion data...
                </TableCell>
              </TableRow>
            ) : filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No promotions found
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {promotion.description}
                      </div>
                      {promotion.coupon_code && (
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="font-mono">
                            {promotion.coupon_code}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => handleCopyCode(promotion.coupon_code || "")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {promotion.discount_type === "percentage" 
                      ? `${promotion.discount_value}%` 
                      : `₱${promotion.discount_value}`}
                    {promotion.minimum_purchase && (
                      <div className="text-xs text-muted-foreground">
                        Min. purchase: ₱{promotion.minimum_purchase}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                    </div>
                    {isScheduled(promotion.start_date) && (
                      <Badge variant="outline" className="mt-1">Scheduled</Badge>
                    )}
                    {isExpired(promotion.end_date) && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 mt-1">Expired</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {promotion.usage_count} 
                    {promotion.usage_limit && ` / ${promotion.usage_limit}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`active-${promotion.id}`}
                        checked={promotion.is_active}
                        onCheckedChange={(checked) => 
                          handleToggleActive(promotion.id, promotion.is_active)
                        }
                        aria-label="Toggle promotion active status"
                      />
                      <span className={promotion.is_active ? "text-green-600" : "text-gray-500"}>
                        {promotion.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPromotion(promotion)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePromotion(promotion)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setCurrentPromotion(promotion);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
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
      
      {isFormModalOpen && (
        <PromotionFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={fetchPromotions}
          promotion={currentPromotion}
        />
      )}
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this promotion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePromotion}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionManagement;
