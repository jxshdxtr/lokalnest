
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  timeFilter,
  onTimeFilterChange,
  sortBy,
  onSortByChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 w-full sm:w-[300px]"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={timeFilter} onValueChange={onTimeFilterChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest First</SelectItem>
            <SelectItem value="date_asc">Oldest First</SelectItem>
            <SelectItem value="total_desc">Highest Amount</SelectItem>
            <SelectItem value="total_asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default OrderFilters;
