
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomerFiltersProps {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  statusFilter,
  sortBy,
  onSearchChange,
  onStatusChange,
  onSortChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 w-full sm:w-[300px]"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={onSortChange}>
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
  );
};

export default CustomerFilters;
