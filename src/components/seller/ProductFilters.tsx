
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterProps {
  filterPrice: { min: string; max: string };
  setFilterPrice: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>;
  filterStock: string;
  setFilterStock: React.Dispatch<React.SetStateAction<string>>;
  filterCategory: string;
  setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
  categories: { id: string; name: string }[];
  resetFilters: () => void;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductFilters: React.FC<FilterProps> = ({
  filterPrice,
  setFilterPrice,
  filterStock,
  setFilterStock,
  filterCategory,
  setFilterCategory,
  categories,
  resetFilters,
  setIsFilterOpen
}) => {
  // Create local state to prevent constant re-rendering
  const [localFilterPrice, setLocalFilterPrice] = React.useState(filterPrice);
  const [localFilterStock, setLocalFilterStock] = React.useState(filterStock);
  const [localFilterCategory, setLocalFilterCategory] = React.useState(filterCategory);

  // Initialize local state when props change
  React.useEffect(() => {
    setLocalFilterPrice(filterPrice);
    setLocalFilterStock(filterStock);
    setLocalFilterCategory(filterCategory);
  }, [filterPrice, filterStock, filterCategory]);

  // Handle Apply Filters to update parent state all at once
  const handleApplyFilters = () => {
    setFilterPrice(localFilterPrice);
    setFilterStock(localFilterStock);
    setFilterCategory(localFilterCategory);
    setIsFilterOpen(false);
  };

  // Handle local reset
  const handleResetFilters = () => {
    resetFilters();
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Filter Products</h4>
      
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Min"
            type="number"
            min="0"
            value={localFilterPrice.min}
            onChange={(e) => setLocalFilterPrice({ ...localFilterPrice, min: e.target.value })}
          />
          <span>to</span>
          <Input
            placeholder="Max"
            type="number"
            min="0"
            value={localFilterPrice.max}
            onChange={(e) => setLocalFilterPrice({ ...localFilterPrice, max: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={localFilterCategory}
          onValueChange={setLocalFilterCategory}
        >
          <SelectTrigger>
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
      
      <div className="space-y-2">
        <Label>Stock Status</Label>
        <Select
          value={localFilterStock}
          onValueChange={setLocalFilterStock}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleResetFilters}>
          Reset
        </Button>
        <Button size="sm" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
