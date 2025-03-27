
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
  slug: string;
}

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categories: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  subtitle,
  categories,
}) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/category/${category.slug}`}
              className={cn(
                "group relative h-[300px] overflow-hidden rounded-lg",
                "border border-border hover:border-gray-300 transition-all duration-300",
                "hover:shadow-elevation-2"
              )}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 z-10"></div>
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 p-6">
                <h3 className="text-2xl font-bold mb-2 text-center">{category.name}</h3>
                <p className="text-white/80 text-sm">{category.count} Products</p>
                <div 
                  className={cn(
                    "mt-4 py-2 px-4 bg-white/10 backdrop-blur-sm rounded-full",
                    "border border-white/20 text-sm font-medium",
                    "transform transition-transform duration-300 group-hover:translate-y-0",
                    "opacity-80 group-hover:opacity-100"
                  )}
                >
                  Explore Collection
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
