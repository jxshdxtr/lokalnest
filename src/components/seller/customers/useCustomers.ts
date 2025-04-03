
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view customers');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.rpc('get_seller_customers', {
        seller_id_param: session.user.id
      });

      if (error) {
        console.error("Error fetching customers with RPC:", error);
        // Fallback to mock data if RPC fails
        fetchMockCustomers();
        return;
      }
      
      // Transform the data
      const customerData: Customer[] = data?.map((customer: any) => ({
        id: customer.profile_id || '',
        full_name: customer.full_name || 'Anonymous Customer',
        email: customer.email,
        avatar_url: customer.avatar_url,
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
      // Use mock data as fallback
      fetchMockCustomers();
    } finally {
      setLoading(false);
    }
  };

  const fetchMockCustomers = () => {
    // Mock data for development/fallback
    const mockCustomers: Customer[] = [
      {
        id: '1',
        full_name: 'John Doe',
        email: 'john@example.com',
        avatar_url: '',
        total_orders: 5,
        total_spent: 500,
        last_purchase_date: new Date().toISOString(),
        status: 'active',
        tags: ['regular', 'high-value']
      },
      {
        id: '2',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        avatar_url: '',
        total_orders: 3,
        total_spent: 350,
        last_purchase_date: new Date().toISOString(),
        status: 'active',
        tags: ['new']
      },
      {
        id: '3',
        full_name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar_url: '',
        total_orders: 1,
        total_spent: 120,
        last_purchase_date: '2023-12-01T12:00:00Z',
        status: 'inactive',
        tags: []
      }
    ];
    
    setCustomers(mockCustomers);
    toast.warning('Using mock data as fallback');
  };

  const updateCustomerStatus = async (customerId: string, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Use RPC for updating status
      const { error } = await supabase.rpc('update_customer_status', {
        customer_id_param: customerId,
        seller_id_param: session.user.id,
        status_param: status
      });
      
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
  const getFilteredAndSortedCustomers = () => {
    // Filter customers
    const filtered = customers.filter(customer => {
      // Search term filter
      const searchMatch = 
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Status filter
      const statusMatch = statusFilter === 'all' || customer.status === statusFilter;
      
      return searchMatch && statusMatch;
    });

    // Sort customers
    return [...filtered].sort((a, b) => {
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
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers: getFilteredAndSortedCustomers(),
    loading,
    searchTerm,
    statusFilter,
    sortBy,
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    updateCustomerStatus,
    fetchCustomers
  };
};
