
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';
import { toast } from 'sonner';

export const useCustomers = () => {
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
    
    try {
      // Try to use the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_seller_customers', {
        seller_id: 'current_seller_id' // Replace with actual seller ID in production
      });
      
      if (!rpcError && rpcData) {
        setCustomers(rpcData);
      } else {
        console.error('RPC error:', rpcError);
        
        // Fallback to mock data
        const mockCustomers: Customer[] = [
          {
            id: '1',
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+63 912 345 6789',
            location: 'Manila, Philippines',
            total_orders: 12,
            total_spent: 15000,
            last_purchase_date: '2024-03-15',
            status: 'active',
            tags: ['repeat', 'premium']
          },
          {
            id: '2',
            full_name: 'Maria Santos',
            email: 'maria@example.com',
            phone: '+63 923 456 7890',
            location: 'Cebu City, Philippines',
            total_orders: 8,
            total_spent: 9500,
            last_purchase_date: '2024-03-01',
            status: 'active',
            tags: ['new']
          },
          {
            id: '3',
            full_name: 'Roberto Garcia',
            email: 'roberto@example.com',
            phone: '+63 934 567 8901',
            location: 'Davao City, Philippines',
            total_orders: 5,
            total_spent: 6300,
            last_purchase_date: '2024-02-20',
            status: 'inactive',
            tags: []
          },
          {
            id: '4',
            full_name: 'Elena Magtanggol',
            email: 'elena@example.com',
            phone: '+63 945 678 9012',
            location: 'Iloilo City, Philippines',
            total_orders: 23,
            total_spent: 32000,
            last_purchase_date: '2024-03-18',
            status: 'active',
            tags: ['repeat', 'premium', 'wholesale']
          },
          {
            id: '5',
            full_name: 'Michael Tan',
            email: 'michael@example.com',
            phone: '+63 956 789 0123',
            location: 'Baguio City, Philippines',
            total_orders: 3,
            total_spent: 4200,
            last_purchase_date: '2024-01-10',
            status: 'inactive',
            tags: ['seasonal']
          }
        ];
        
        setCustomers(mockCustomers);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError('Failed to fetch customers');
      toast.error('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addTag = async (customerId: string, tag: string) => {
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
  }, []);
  
  // Filtered and sorted customers
  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const matchesSearch = search === '' || 
      customer.full_name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase());
      
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
    const valueA = String(a[sortField]).toLowerCase();
    const valueB = String(b[sortField]).toLowerCase();
    
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
