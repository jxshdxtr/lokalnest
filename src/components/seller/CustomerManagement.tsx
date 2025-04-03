
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Users, 
  UserPlus, 
  ShoppingBag, 
  Calendar,
  MoreHorizontal,
  Edit,
  Mail,
  MessagesSquare,
  UserX,
  Tag,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistance } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Customer {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  total_orders: number;
  total_spent: number;
  last_purchase_date: string;
  status: string;
  tags?: string[];
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view customers');
        navigate('/auth');
        return;
      }

      // Fetch customer data
      const { data, error } = await supabase
        .from('seller_customers')
        .select(`
          id,
          total_orders,
          total_spent,
          last_purchase_date,
          status,
          tags,
          profiles:customer_id(id, full_name, email, avatar_url)
        `)
        .eq('seller_id', session.user.id);
        
      if (error) throw error;
      
      // Transform the data
      const customerData = data?.map(customer => ({
        id: customer.profiles?.id || '',
        full_name: customer.profiles?.full_name || 'Anonymous Customer',
        email: customer.profiles?.email,
        avatar_url: customer.profiles?.avatar_url,
        total_orders: customer.total_orders || 0,
        total_spent: customer.total_spent || 0,
        last_purchase_date: customer.last_purchase_date || '',
        status: customer.status || 'active',
        tags: customer.tags || []
      })) || [];
      
      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const updateCustomerStatus = async (customerId: string, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { error } = await supabase
        .from('seller_customers')
        .update({ status })
        .eq('seller_id', session.user.id)
        .eq('customer_id', customerId);
        
      if (error) throw error;
      
      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === customerId ? { ...customer, status } : customer
      ));
      
      toast.success(`Customer status updated to ${status}`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    }
  };

  // Filter and sort customers
  const filteredCustomers = customers.filter(customer => {
    // Search term filter
    const searchMatch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    // Status filter
    const statusMatch = statusFilter === 'all' || customer.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.last_purchase_date || '').getTime() - new Date(a.last_purchase_date || '').getTime();
    } else if (sortBy === 'orders') {
      return b.total_orders - a.total_orders;
    } else if (sortBy === 'spent') {
      return b.total_spent - a.total_spent;
    } else {
      return a.full_name.localeCompare(b.full_name);
    }
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatLastPurchaseDate = (dateString: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent Purchase</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="orders">Total Orders</SelectItem>
                  <SelectItem value="spent">Total Spent</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Customer</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Tags</th>
                    <th className="text-center p-3 text-sm font-medium">Orders</th>
                    <th className="text-center p-3 text-sm font-medium">Total Spent</th>
                    <th className="text-left p-3 text-sm font-medium">Last Purchase</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={customer.avatar_url} />
                            <AvatarFallback>{getInitials(customer.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.full_name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {customer.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags && customer.tags.length > 0 ? (
                            customer.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.total_orders}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium">₱{customer.total_spent.toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatLastPurchaseDate(customer.last_purchase_date)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessagesSquare className="h-4 w-4 mr-2" />
                              Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="h-4 w-4 mr-2" />
                              Add Tags
                            </DropdownMenuItem>
                            {customer.status === 'active' ? (
                              <DropdownMenuItem onClick={() => updateCustomerStatus(customer.id, 'inactive')}>
                                <UserX className="h-4 w-4 mr-2" />
                                Mark Inactive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => updateCustomerStatus(customer.id, 'active')}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Mark Active
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search filters.'
                  : "You don't have any customers yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
