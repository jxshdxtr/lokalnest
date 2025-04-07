
import React, { useState, useEffect } from 'react';
import ProductGrid from '../product/ProductGrid';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, ProductWithSeller } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  staticProducts?: ProductWithSeller[];
  viewAllLink?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  title,
  subtitle,
  staticProducts,
  viewAllLink = '/products',
}) => {
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(!staticProducts);

  useEffect(() => {
    if (staticProducts) {
      setProducts(staticProducts);
      return;
    }

    const loadProducts = async () => {
      try {
        const fetchedProducts = await getFeaturedProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [staticProducts]);

  return (
    <section id="featured-products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-3">{title}</h2>
            {subtitle && <p className="text-muted-foreground max-w-2xl">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="mt-4 md:mt-0">
              <Button variant="outline" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} columns={4} />
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
