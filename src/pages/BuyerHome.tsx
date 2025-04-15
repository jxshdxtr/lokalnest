import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductGrid from '@/components/product/ProductGrid';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Mock data for demonstration
const mockProducts = [
  {
    id: "1",
    name: "Handwoven Cotton Tote Bag",
    price: 850,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2670&q=80",
    seller: "Bahay Hablon",
    category: "Textiles & Clothing",
    location: "Iloilo"
  },
  {
    id: "2",
    name: "Wooden Salad Bowl Set",
    price: 1200,
    image: "https://images.unsplash.com/photo-1567374783966-0991fefd5ebb?auto=format&fit=crop&w=800&q=80",
    seller: "Crafts by Juan",
    category: "Wooden Crafts",
    location: "Pampanga"
  },
  {
    id: "3",
    name: "Hand-Painted Ceramic Mug",
    price: 350,
    image: "https://images.unsplash.com/photo-1491374812364-00028bbe7d2f?auto=format&fit=crop&w=800&q=80",
    seller: "Pottery Haven",
    category: "Pottery & Ceramics",
    location: "Batangas"
  },
  {
    id: "4",
    name: "Beaded Statement Necklace",
    price: 750,
    image: "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=800&q=80",
    seller: "Indigenous Gems",
    category: "Jewelry & Accessories",
    location: "Davao"
  },
  {
    id: "5",
    name: "Handmade Abaca Lamp Shade",
    price: 1800,
    image: "https://images.unsplash.com/photo-1543122264-70dcbf81145e?auto=format&fit=crop&w=800&q=80",
    seller: "Luna Home Decor",
    category: "Home Decor",
    location: "Cebu"
  },
  {
    id: "6",
    name: "Coconut Shell Candles (Set of 3)",
    price: 650,
    image: "https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=800&q=80",
    seller: "Eco Crafts PH",
    category: "Home Decor",
    location: "Palawan"
  },
  {
    id: "7",
    name: "Hand-Embroidered Table Runner",
    price: 1200,
    image: "https://images.unsplash.com/photo-1635761764097-d611d9101743?auto=format&fit=crop&w=800&q=80",
    seller: "Mana Embroidery",
    category: "Textiles & Clothing",
    location: "Baguio"
  },
  {
    id: "8",
    name: "Bamboo Utensil Set",
    price: 450,
    image: "https://images.unsplash.com/photo-1585076803376-620d785e2601?auto=format&fit=crop&w=800&q=80",
    seller: "Eco Home PH",
    category: "Home Decor",
    location: "Laguna"
  }
];

const categories = [
  "All Categories",
  "Textiles & Clothing",
  "Wooden Crafts",
  "Pottery & Ceramics",
  "Jewelry & Accessories",
  "Home Decor",
  "Food & Beverages",
  "Art & Paintings",
  "Soaps & Cosmetics"
];

const locations = [
  "All Locations",
  "Iloilo",
  "Pampanga",
  "Batangas",
  "Davao",
  "Cebu",
  "Palawan",
  "Baguio",
  "Laguna"
];

const BuyerHome: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('popular');
  
  // Filter products based on search, category, location, and price
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All Locations' || product.location === selectedLocation;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      default:
        return 0; // Keep original order for 'popular'
    }
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search and filter section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products, sellers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="name-a-z">Name: A to Z</SelectItem>
                  <SelectItem value="name-z-a">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Narrow down products based on your preferences.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    {/* Category filter */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Location filter */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Seller Location</Label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Price range filter */}
                    <div className="space-y-4">
                      <Label>Price Range</Label>
                      <Slider
                        defaultValue={[0, 5000]}
                        min={0}
                        max={5000}
                        step={100}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex justify-between text-sm">
                        <span>₱{priceRange[0]}</span>
                        <span>₱{priceRange[1]}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <SheetClose asChild>
                        <Button>Apply Filters</Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedCategory !== 'All Categories' && (
            <div className="bg-secondary text-sm px-3 py-1 rounded-full flex items-center">
              {selectedCategory}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setSelectedCategory('All Categories')}
              >
                ✕
              </Button>
            </div>
          )}
          {selectedLocation !== 'All Locations' && (
            <div className="bg-secondary text-sm px-3 py-1 rounded-full flex items-center">
              {selectedLocation}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setSelectedLocation('All Locations')}
              >
                ✕
              </Button>
            </div>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 5000) && (
            <div className="bg-secondary text-sm px-3 py-1 rounded-full flex items-center">
              ₱{priceRange[0]} - ₱{priceRange[1]}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setPriceRange([0, 5000])}
              >
                ✕
              </Button>
            </div>
          )}
        </div>

        {/* Products display */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'} Found
          </h2>
          <ProductGrid products={sortedProducts} columns={4} />
        </div>
      </div>
    </Layout>
  );
};

export default BuyerHome;
