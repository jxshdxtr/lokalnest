
import React from 'react';
import ProductGrid from '../product/ProductGrid';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  category: string;
  location: string;
}

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  title,
  subtitle,
  products,
  viewAllLink = '/products',
}) => {
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

        <ProductGrid products={products} columns={4} />
      </div>
    </section>
  );
};

export default FeaturedProducts;
