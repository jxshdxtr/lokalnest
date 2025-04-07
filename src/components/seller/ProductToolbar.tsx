
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Plus, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ProductToolbarProps {
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddProduct: () => void;
  isFilterOpen: boolean;
  setIsFilterOpen?: (isOpen: boolean) => void;
  toggleFilter?: () => void;
  filterPrice?: { min: string; max: string };
  setFilterPrice?: (price: { min: string; max: string }) => void;
  filterStock?: string;
  setFilterStock?: (stock: string) => void;
  filterCategory?: string;
  setFilterCategory?: (category: string) => void;
  resetFilters?: () => void;
  categories?: {id: string, name: string}[];
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
  searchTerm,
  handleSearch,
  handleAddProduct,
  isFilterOpen,
  setIsFilterOpen,
  toggleFilter,
  filterPrice = { min: '', max: '' },
  setFilterPrice = () => {},
  filterStock = 'all',
  setFilterStock = () => {},
  filterCategory = '',
  setFilterCategory = () => {},
  resetFilters = () => {},
  categories = []
}) => {
  const [minPrice, setMinPrice] = useState(filterPrice.min);
  const [maxPrice, setMaxPrice] = useState(filterPrice.max);

  const applyPriceFilter = () => {
    setFilterPrice({ min: minPrice, max: maxPrice });
  };

  const handleToggleFilter = () => {
    if (toggleFilter) {
      toggleFilter();
    } else if (setIsFilterOpen) {
      setIsFilterOpen(!isFilterOpen);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 w-full sm:w-[300px]"
        />
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleToggleFilter}>
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {isFilterOpen && <X className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-4">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Price Range</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="w-20"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    className="w-20"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                  <Button size="sm" onClick={applyPriceFilter}>
                    Set
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium">Category</h4>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium">Stock Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="all-stock" 
                      checked={filterStock === 'all'} 
                      onCheckedChange={() => setFilterStock('all')}
                    />
                    <Label htmlFor="all-stock">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-stock" 
                      checked={filterStock === 'in_stock'} 
                      onCheckedChange={() => setFilterStock('in_stock')}
                    />
                    <Label htmlFor="in-stock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="low-stock" 
                      checked={filterStock === 'low_stock'} 
                      onCheckedChange={() => setFilterStock('low_stock')}
                    />
                    <Label htmlFor="low-stock">Low Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="out-of-stock" 
                      checked={filterStock === 'out_of_stock'} 
                      onCheckedChange={() => setFilterStock('out_of_stock')}
                    />
                    <Label htmlFor="out-of-stock">Out of Stock</Label>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductToolbar;
