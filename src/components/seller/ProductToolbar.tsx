
import React from 'react';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ProductFilters from './ProductFilters';

interface ProductToolbarProps {
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddProduct: () => void;
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterPrice: { min: string; max: string };
  setFilterPrice: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>;
  filterStock: string;
  setFilterStock: React.Dispatch<React.SetStateAction<string>>;
  filterCategory: string;
  setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
  categories: { id: string; name: string }[];
  resetFilters: () => void;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
  searchTerm,
  handleSearch,
  handleAddProduct,
  isFilterOpen,
  setIsFilterOpen,
  filterPrice,
  setFilterPrice,
  filterStock,
  setFilterStock,
  filterCategory,
  setFilterCategory,
  categories,
  resetFilters,
}) => {
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
      <div className="flex gap-3 w-full sm:w-auto">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <ProductFilters
              filterPrice={filterPrice}
              setFilterPrice={setFilterPrice}
              filterStock={filterStock}
              setFilterStock={setFilterStock}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
              resetFilters={resetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleAddProduct} className="w-full sm:w-auto">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductToolbar;
