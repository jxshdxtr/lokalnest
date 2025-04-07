
import React from 'react';
import { 
  Edit, 
  Trash2,
  Copy,
  MoreHorizontal,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  category_name?: string;
  stock: number;
  status: string;
  description?: string;
  created_at?: string;
  categories?: { name: string };
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  filteredProducts: Product[];
  handleEditProduct: (product: Product) => void;
  handleViewProduct: (product: Product) => void;
  handleDeleteProduct: (productId: string) => void;
  handleDuplicateProduct: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  loading,
  filteredProducts,
  handleEditProduct,
  handleViewProduct,
  handleDeleteProduct,
  handleDuplicateProduct,
}) => {
  
  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
    }
  };

  // Helper function to get category name
  const getCategoryName = (product: Product): string => {
    if (product.categories?.name) {
      return product.categories.name;
    }
    if (product.category_name) {
      return product.category_name;
    }
    if (product.category) {
      return product.category;
    }
    return 'Uncategorized';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="p-3 text-sm font-medium">Product</th>
            <th className="p-3 text-sm font-medium">Category</th>
            <th className="p-3 text-sm font-medium">Price</th>
            <th className="p-3 text-sm font-medium">Stock</th>
            <th className="p-3 text-sm font-medium">Status</th>
            <th className="p-3 text-sm font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-6 text-center">
                Loading products...
              </td>
            </tr>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                          <SlidersHorizontal className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="truncate max-w-[200px]">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">{getCategoryName(product)}</td>
                <td className="p-3 text-sm">₱{product.price.toFixed(2)}</td>
                <td className="p-3 text-sm">{product.stock}</td>
                <td className="p-3 text-sm">
                  {getStatusBadge(product.status, product.stock)}
                </td>
                <td className="p-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted-foreground">
                No products found. Try adjusting your search or filters, or add a new product.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
