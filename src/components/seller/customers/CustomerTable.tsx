import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Calendar,
  MoreHorizontal,
  Eye,
  MessagesSquare,
  UserX,
  UserPlus,
  Loader2
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Customer } from './types';
import { toast } from 'sonner';
import CustomerMessaging from './CustomerMessaging';
import CustomerDetails from './CustomerDetails';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onUpdateStatus: (customerId: string, status: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, loading, onUpdateStatus }) => {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
  
  const handleSendMessage = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsMessagingOpen(true);
  };
  
  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (customers.length === 0) {
    return null; // Empty state will be handled by the parent component
  }
  
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-sm font-medium">Customer</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              {/* <th className="text-left p-3 text-sm font-medium">Tags</th> */}
              <th className="text-center p-3 text-sm font-medium">Orders</th>
              <th className="text-center p-3 text-sm font-medium">Total Spent</th>
              <th className="text-left p-3 text-sm font-medium">Last Purchase</th>
              <th className="text-right p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
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
                {/* <td className="p-3">
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
                </td> */}
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
                      <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendMessage(customer)}>
                        <MessagesSquare className="h-4 w-4 mr-2" />
                        Message
                      </DropdownMenuItem>
                      {/* 
                      {customer.status === 'active' ? (
                        <DropdownMenuItem onClick={() => onUpdateStatus(customer.id, 'inactive')}>
                          <UserX className="h-4 w-4 mr-2" />
                          Mark Inactive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onUpdateStatus(customer.id, 'active')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Mark Active
                        </DropdownMenuItem>
                      )}
                      */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <CustomerMessaging 
        customer={selectedCustomer}
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
      
      <CustomerDetails
        customer={selectedCustomer}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};

export default CustomerTable;