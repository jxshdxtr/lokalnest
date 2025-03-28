
import React, { useState } from 'react';
import { 
  Filter,
  Search,
  Edit,
  Trash,
  Flag,
  CheckCircle2,
  PlusCircle,
  X,
  FolderPlus,
  MoreHorizontal,
  AlertTriangle,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Handcrafted Wooden Bowl',
    seller: {
      id: '101',
      name: 'Artisan Woodworks',
      verified: true
    },
    category: 'Wooden Crafts',
    subcategory: 'Kitchen Items',
    price: '$45.00',
    stock: 12,
    status: 'approved',
    listed: '2 weeks ago',
    image: 'https://images.unsplash.com/photo-1635908365032-ec05c96a4cce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    sales: 24,
    rating: 4.7,
    flags: 0
  },
  {
    id: '2',
    name: 'Hand-woven Textile Wall Hanging',
    seller: {
      id: '102',
      name: 'Traditional Textiles',
      verified: true
    },
    category: 'Textiles & Clothing',
    subcategory: 'Home Decor',
    price: '$89.99',
    stock: 5,
    status: 'approved',
    listed: '1 month ago',
    image: 'https://images.unsplash.com/photo-1612975723720-723738693cec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    sales: 18,
    rating: 4.9,
    flags: 0
  },
  {
    id: '3',
    name: 'Artisan Ceramic Mug Set',
    seller: {
      id: '103',
      name: 'Pottery Studio',
      verified: false
    },
    category: 'Pottery & Ceramics',
    subcategory: 'Kitchenware',
    price: '$65.00',
    stock: 8,
    status: 'pending',
    listed: '2 days ago',
    image: 'https://images.unsplash.com/photo-1596361891427-64f92faca333?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    sales: 0,
    rating: 0,
    flags: 0
  },
  {
    id: '4',
    name: 'Handmade Silver Earrings',
    seller: {
      id: '104',
      name: 'Artisanal Jewelry',
      verified: true
    },
    category: 'Jewelry & Accessories',
    subcategory: 'Earrings',
    price: '$78.50',
    stock: 15,
    status: 'approved',
    listed: '3 weeks ago',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    sales: 32,
    rating: 4.6,
    flags: 0
  },
  {
    id: '5',
    name: 'Organic Herb Bath Salts',
    seller: {
      id: '105',
      name: 'Natural Remedies',
      verified: true
    },
    category: 'Soaps & Cosmetics',
    subcategory: 'Bath Products',
    price: '$28.99',
    stock: 25,
    status: 'flagged',
    listed: '1 week ago',
    image: 'https://images.unsplash.com/photo-1608613301988-c9b800a9d841?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    sales: 7,
    rating: 3.2,
    flags: 3,
    flagReasons: ['Inappropriate content', 'Misleading description', 'Safety concern']
  },
];

// Mock categories
const mockCategories = [
  {
    id: '1',
    name: 'Textiles & Clothing',
    subcategories: ['Clothing', 'Accessories', 'Home Decor', 'Bags & Purses'],
    productCount: 245,
    icon: '👕'
  },
  {
    id: '2',
    name: 'Wooden Crafts',
    subcategories: ['Furniture', 'Kitchen Items', 'Decor', 'Toys'],
    productCount: 187,
    icon: '🪵'
  },
  {
    id: '3',
    name: 'Pottery & Ceramics',
    subcategories: ['Kitchenware', 'Decor', 'Vases', 'Figurines'],
    productCount: 163,
    icon: '🏺'
  },
  {
    id: '4',
    name: 'Jewelry & Accessories',
    subcategories: ['Necklaces', 'Earrings', 'Bracelets', 'Rings'],
    productCount: 298,
    icon: '💍'
  },
  {
    id: '5',
    name: 'Home Decor',
    subcategories: ['Wall Art', 'Cushions', 'Rugs', 'Lighting'],
    productCount: 214,
    icon: '🏡'
  },
  {
    id: '6',
    name: 'Food & Beverages',
    subcategories: ['Jams & Preserves', 'Teas', 'Spices', 'Baked Goods'],
    productCount: 92,
    icon: '🍯'
  },
  {
    id: '7',
    name: 'Art & Paintings',
    subcategories: ['Original Art', 'Prints', 'Photography', 'Illustrations'],
    productCount: 165,
    icon: '🎨'
  },
  {
    id: '8',
    name: 'Soaps & Cosmetics',
    subcategories: ['Soaps', 'Bath Products', 'Skincare', 'Essential Oils'],
    productCount: 118,
    icon: '🧼'
  },
];

const ProductOversight = () => {
  const [products, setProducts] = useState(mockProducts);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  // New category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newSubcategories, setNewSubcategories] = useState('');

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleProductApproval = (productId: string, status: 'approved' | 'rejected') => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        return { ...product, status: status };
      }
      return product;
    }));

    toast({
      title: `Product ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `Product has been ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      variant: status === 'approved' ? 'default' : 'destructive',
    });
  };

  const handleRemoveFlag = (productId: string) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        return { 
          ...product, 
          status: 'approved',
          flags: 0,
          flagReasons: undefined
        };
      }
      return product;
    }));

    toast({
      title: "Flags Removed",
      description: "All flags have been removed from this product.",
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(product => product.id !== productId));
    
    toast({
      title: "Product Deleted",
      description: "Product has been deleted successfully.",
      variant: "destructive",
    });
  };

  const showProductDetails = (product: any) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };

  const handleAddCategory = () => {
    const newCategory = {
      id: (categories.length + 1).toString(),
      name: newCategoryName,
      icon: newCategoryIcon || '📦',
      subcategories: newSubcategories.split(',').map(s => s.trim()),
      productCount: 0
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryIcon('');
    setNewSubcategories('');
    setIsAddCategoryOpen(false);
    
    toast({
      title: "Category Added",
      description: `${newCategoryName} has been added successfully.`,
    });
  };

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!selectedCategory) return;
    
    setCategories(categories.map(category => {
      if (category.id === selectedCategory.id) {
        return selectedCategory;
      }
      return category;
    }));
    
    setIsEditCategoryOpen(false);
    
    toast({
      title: "Category Updated",
      description: `${selectedCategory.name} has been updated successfully.`,
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(category => category.id !== categoryId));
    
    toast({
      title: "Category Deleted",
      description: "Category has been deleted successfully.",
      variant: "destructive",
    });
  };

  const getProductStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'flagged':
        return <Badge variant="outline" className="text-red-500 border-red-500">Flagged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Approve, reject, and manage product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-md overflow-hidden">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  by {product.seller.name}
                                  {product.seller.verified && (
                                    <CheckCircle2 className="h-3 w-3 text-blue-500 inline ml-1" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{product.category}</div>
                              <div className="text-xs text-muted-foreground">{product.subcategory}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>{getProductStatusBadge(product.status)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {product.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleProductApproval(product.id, 'approved')}
                                    className="text-green-500"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleProductApproval(product.id, 'rejected')}
                                    className="text-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {product.status === 'flagged' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveFlag(product.id)}
                                  className="text-blue-500"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => showProductDetails(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => showProductDetails(product)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-500">
                                    Delete Product
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage product categories and subcategories</CardDescription>
              </div>
              <Button onClick={() => setIsAddCategoryOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{category.icon}</div>
                          <CardTitle>{category.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category.id)}>
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory(category.id)} 
                              className="text-red-500"
                            >
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        {category.productCount} products
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm font-medium mb-2">Subcategories:</div>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.map((subcategory, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {subcategory}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="flagged" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Products</CardTitle>
              <CardDescription>Review and address products flagged by users</CardDescription>
            </CardHeader>
            <CardContent>
              {products.filter(p => p.status === 'flagged').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No flagged products at this time
                </div>
              ) : (
                <div className="space-y-4">
                  {products.filter(p => p.status === 'flagged').map((product) => (
                    <Card key={product.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  by {product.seller.name} • {product.category}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-red-500 border-red-500 flex items-center w-fit">
                                <Flag className="h-3 w-3 mr-1" />
                                {product.flags} flags
                              </Badge>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="flags">
                                <AccordionTrigger className="text-sm py-2">
                                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                  View flag reasons
                                </AccordionTrigger>
                                <AccordionContent>
                                  <ul className="space-y-1 text-sm pl-6 list-disc">
                                    {product.flagReasons?.map((reason, idx) => (
                                      <li key={idx} className="text-muted-foreground">{reason}</li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                            
                            <div className="flex justify-end gap-2 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRemoveFlag(product.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Clear Flags
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-500"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Remove Product
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => showProductDetails(product)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      <Dialog open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Review product information</DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                  <div className="rounded-md overflow-hidden h-40 sm:h-auto">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-2/3 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getProductStatusBadge(selectedProduct.status)}
                      <div className="text-sm text-muted-foreground">
                        Listed {selectedProduct.listed}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-medium">{selectedProduct.price}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">In Stock</div>
                      <div className="font-medium">{selectedProduct.stock} units</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium">{selectedProduct.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Subcategory</div>
                      <div className="font-medium">{selectedProduct.subcategory}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Seller</div>
                    <div className="font-medium flex items-center gap-1">
                      {selectedProduct.seller.name}
                      {selectedProduct.seller.verified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>

                  {selectedProduct.sales > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Sales</div>
                        <div className="font-medium">{selectedProduct.sales} units</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                        <div className="font-medium">{selectedProduct.rating} / 5</div>
                      </div>
                    </div>
                  )}

                  {selectedProduct.flags > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 text-red-500">
                        <Flag className="h-4 w-4" />
                        Flagged {selectedProduct.flags} times
                      </div>
                      <div className="mt-1">
                        <div className="text-sm font-medium">Reasons:</div>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                          {selectedProduct.flagReasons?.map((reason: string, idx: number) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsProductDetailsOpen(false)}>
              Close
            </Button>
            {selectedProduct && selectedProduct.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-green-500 border-green-500"
                  onClick={() => {
                    handleProductApproval(selectedProduct.id, 'approved');
                    setIsProductDetailsOpen(false);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500"
                  onClick={() => {
                    handleProductApproval(selectedProduct.id, 'rejected');
                    setIsProductDetailsOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            {selectedProduct && selectedProduct.status === 'flagged' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  handleRemoveFlag(selectedProduct.id);
                  setIsProductDetailsOpen(false);
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Clear Flags
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Paper Crafts"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryIcon">Category Icon (emoji)</Label>
              <Input
                id="categoryIcon"
                placeholder="e.g., 📝"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subcategories">Subcategories</Label>
              <Input
                id="subcategories"
                placeholder="e.g., Cards, Origami, Scrapbooking (comma separated)"
                value={newSubcategories}
                onChange={(e) => setNewSubcategories(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate subcategories with commas</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory}
              disabled={!newCategoryName || !newSubcategories}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editCategoryIcon">Category Icon (emoji)</Label>
                <Input
                  id="editCategoryIcon"
                  value={selectedCategory.icon}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    icon: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editSubcategories">Subcategories</Label>
                <Input
                  id="editSubcategories"
                  value={selectedCategory.subcategories.join(', ')}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    subcategories: e.target.value.split(',').map(s => s.trim())
                  })}
                />
                <p className="text-xs text-muted-foreground">Separate subcategories with commas</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCategory}
              disabled={!selectedCategory || !selectedCategory.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductOversight;
