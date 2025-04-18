import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Customer } from './types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Mail } from 'lucide-react';

interface CustomerDetailsProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, isOpen, onClose }) => {
  if (!customer) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            View detailed information about this customer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Customer header with avatar and name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer.avatar_url} />
              <AvatarFallback className="text-lg">{getInitials(customer.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{customer.full_name}</h3>
              <p className="text-sm text-muted-foreground">{customer.status === 'active' ? 'Active Customer' : 'Inactive Customer'}</p>
            </div>
          </div>
          
          {/* Contact information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone || 'No phone number provided'}</span>
              </div>
            </div>
          </div>
          
          {/* Address information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Address Information</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{customer.location || 'No address provided'}</p>
                  {customer.location && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {/* Display city, province, postal code here when available in the Customer type */}
                      {/* For now showing placeholder or location as fallback */}
                      <p>City: {customer.city || 'Not available'}</p>
                      <p>Province: {customer.province || 'Not available'}</p>
                      <p>Postal Code: {customer.postal_code || 'Not available'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Order statistics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Order Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-lg font-semibold">{customer.total_orders}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-lg font-semibold">₱{customer.total_spent.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          {customer.tags && customer.tags.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag, index) => (
                  <div key={index} className="bg-secondary text-sm px-3 py-1 rounded-full">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetails;