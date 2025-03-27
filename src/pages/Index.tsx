
import React from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategorySection from '@/components/home/CategorySection';
import ProducerSpotlight from '@/components/home/ProducerSpotlight';
import Features from '@/components/home/Features';

// Sample data for demonstration
const featuredProducts = [
  {
    id: "1",
    name: "Organic Farm-Fresh Eggs",
    price: 120,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    seller: "Green Valley Farm",
    category: "Dairy & Eggs",
    location: "Batangas"
  },
  {
    id: "2",
    name: "Artisanal Sourdough Bread",
    price: 180,
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Bread Haven",
    category: "Bakery",
    location: "Quezon City"
  },
  {
    id: "3",
    name: "Organic Mixed Greens",
    price: 95,
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Harmony Farms",
    category: "Fresh Produce",
    location: "Laguna"
  },
  {
    id: "4",
    name: "Wild Caught Tilapia",
    price: 220,
    image: "https://images.unsplash.com/photo-1578635073170-7b327e73cbb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Seaside Catch",
    category: "Meat & Seafood",
    location: "Bataan"
  },
  {
    id: "5",
    name: "Pure Raw Honey",
    price: 350,
    image: "https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Mountain Apiaries",
    category: "Honey & Preserves",
    location: "Benguet"
  },
  {
    id: "6",
    name: "Hand-Woven Market Basket",
    price: 450,
    image: "https://images.unsplash.com/photo-1590105577767-e21a1067899f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Artisan Hands",
    category: "Handcrafted",
    location: "Ilocos"
  },
  {
    id: "7",
    name: "Grass-Fed Beef Steak",
    price: 580,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    seller: "Green Pastures Farm",
    category: "Meat & Seafood",
    location: "Nueva Ecija"
  },
  {
    id: "8",
    name: "Homemade Mango Jam",
    price: 185,
    image: "https://images.unsplash.com/photo-1533527853550-49d037841d2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    seller: "Sylvia's Pantry",
    category: "Honey & Preserves",
    location: "Guimaras"
  }
];

const categories = [
  {
    id: "1",
    name: "Fresh Produce",
    image: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80",
    count: 48,
    slug: "fresh-produce"
  },
  {
    id: "2",
    name: "Dairy & Eggs",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    count: 32,
    slug: "dairy-eggs"
  },
  {
    id: "3",
    name: "Meat & Seafood",
    image: "https://images.unsplash.com/photo-1595504856044-2c7cc9d7d982?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    count: 27,
    slug: "meat-seafood"
  },
  {
    id: "4",
    name: "Bakery",
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2564&q=80",
    count: 19,
    slug: "bakery"
  },
  {
    id: "5",
    name: "Handcrafted",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2565&q=80",
    count: 36,
    slug: "handcrafted"
  },
  {
    id: "6",
    name: "Honey & Preserves",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    count: 21,
    slug: "honey-preserves"
  }
];

const producers = [
  {
    id: "1",
    name: "Green Valley Farm",
    image: "https://images.unsplash.com/photo-1595829060120-9f309b85e96a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80",
    location: "Batangas",
    description: "Family-owned farm specializing in organic vegetables and free-range eggs. Practicing sustainable farming for over 20 years.",
    productCount: 12
  },
  {
    id: "2",
    name: "Bread Haven",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2570&q=80",
    location: "Quezon City",
    description: "Artisanal bakery creating handcrafted breads using traditional methods and locally-sourced ingredients.",
    productCount: 8
  },
  {
    id: "3",
    name: "Artisan Hands",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    location: "Ilocos",
    description: "Cooperative of skilled craftspeople creating traditional handwoven products using indigenous materials.",
    productCount: 15
  }
];

const Index = () => {
  return (
    <Layout>
      <div className="animate-fade-in">
        <Hero />
        <FeaturedProducts 
          title="Featured Products" 
          subtitle="Discover our curated selection of fresh local products"
          products={featuredProducts}
        />
        <CategorySection 
          title="Shop by Category"
          subtitle="Browse our diverse range of locally-sourced products"
          categories={categories}
        />
        <ProducerSpotlight producers={producers} />
        <Features />
      </div>
    </Layout>
  );
};

export default Index;
