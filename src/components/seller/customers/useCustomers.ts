import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';
import { toast } from 'sonner';
import { useSellerVerification } from '@/hooks/use-seller-verification';

export const useCustomers = () => {
  const { isVerified, sellerId } = useSellerVerification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortField, setSortField] = useState<keyof Customer>('last_purchase_date');

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    // If seller is not verified or sellerId is not available, return empty array
    if (!isVerified || !sellerId) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }
    
    try {
      // Direct query to get seller customers (not using the RPC function since it doesn't exist)
      const { data, error: queryError } = await supabase
        .from('seller_customers')
        .select('*, profiles:customer_id(*)')
        .eq('seller_id', sellerId);
      
      if (!queryError && data) {
        // Map the database results to our Customer interface
        const mappedCustomers: Customer[] = data.map((item: any) => ({
          id: item.id,
          full_name: item.profiles?.full_name || 'Unknown',
          email: item.profiles?.email || '',
          phone: item.profiles?.phone || '',
          location: item.profiles?.location || '',
          avatar_url: item.profiles?.avatar_url,
          total_orders: item.total_orders || 0,
          total_spent: item.total_spent || 0,
          last_purchase_date: item.last_purchase_date || '',
          status: item.status || 'inactive',
          tags: item.tags || []
        }));
        
        setCustomers(mappedCustomers);
      } else {
        console.error('Query error:', queryError);
        setCustomers([]);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError('Failed to fetch customers');
      toast.error('Failed to load customer data');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addTag = async (customerId: string, tag: string) => {
    // Don't perform operations if not verified
    if (!isVerified) return;
    
    try {
      // Find the customer
      const customerIndex = customers.findIndex(c => c.id === customerId);
      if (customerIndex === -1) return;
      
      // Update locally first for UI responsiveness
      const updatedCustomers = [...customers];
      if (!updatedCustomers[customerIndex].tags.includes(tag)) {
        updatedCustomers[customerIndex].tags = [...updatedCustomers[customerIndex].tags, tag];
        setCustomers(updatedCustomers);
      }
      
      // Update in database (this would be replaced with actual API call)
      toast.success(`Added tag '${tag}' to customer`);
      
    } catch (error) {
      toast.error('Failed to add tag');
      console.error(error);
    }
  };
  
  const removeTag = async (customerId: string, tag: string) => {
    // Don't perform operations if not verified
    if (!isVerified) return;
    
    try {
      // Find the customer
      const customerIndex = customers.findIndex(c => c.id === customerId);
      if (customerIndex === -1) return;
      
      // Update locally first for UI responsiveness
      const updatedCustomers = [...customers];
      updatedCustomers[customerIndex].tags = updatedCustomers[customerIndex].tags.filter(t => t !== tag);
      setCustomers(updatedCustomers);
      
      // Update in database (this would be replaced with actual API call)
      toast.success(`Removed tag '${tag}' from customer`);
      
    } catch (error) {
      toast.error('Failed to remove tag');
      console.error(error);
    }
  };
  
  useEffect(() => {
    fetchCustomers();
  }, [isVerified, sellerId]);
  
  // Filtered and sorted customers
  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const matchesSearch = search === '' || 
      customer.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(search.toLowerCase()));
      
    // Status filter
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // For dates
    if (sortField === 'last_purchase_date') {
      if (!a[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (!b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      
      return sortOrder === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    
    // For numbers
    if (typeof a[sortField] === 'number' && typeof b[sortField] === 'number') {
      return sortOrder === 'asc'
        ? (a[sortField] as number) - (b[sortField] as number)
        : (b[sortField] as number) - (a[sortField] as number);
    }
    
    // For strings
    const valueA = String(a[sortField] || '').toLowerCase();
    const valueB = String(b[sortField] || '').toLowerCase();
    
    if (sortOrder === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  return {
    customers: filteredCustomers,
    isLoading,
    error,
    isVerified,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    sortField,
    setSortField,
    addTag,
    removeTag,
    refreshCustomers: fetchCustomers
  };
};
