
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
    name: "Handwoven Cotton Tote Bag",
    price: 850,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    seller: "Bahay Hablon",
    category: "Textiles & Clothing",
    location: "Iloilo"
  },
  {
    id: "2",
    name: "Handcrafted Wooden Serving Bowl",
    price: 1200,
    image: "https://images.unsplash.com/photo-1635995158887-316c704fa35d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Kalinga Woodcraft",
    category: "Wooden Crafts",
    location: "Baguio"
  },
  {
    id: "3",
    name: "Hand-painted Ceramic Mug",
    price: 450,
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Binhi Pottery",
    category: "Pottery & Ceramics",
    location: "Laguna"
  },
  {
    id: "4",
    name: "Handcrafted Silver Earrings",
    price: 1800,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Isla Silver",
    category: "Jewelry & Accessories",
    location: "Davao"
  },
  {
    id: "5",
    name: "Handwoven Bamboo Wall Hanging",
    price: 1650,
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Anahaw Home",
    category: "Home Decor",
    location: "Cebu"
  },
  {
    id: "6",
    name: "Artisanal Coconut Jam Set",
    price: 420,
    image: "https://images.unsplash.com/photo-1612200482741-3ad34fcd2eb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=80",
    seller: "Langkay Foods",
    category: "Food & Beverages",
    location: "Quezon"
  },
  {
    id: "7",
    name: "Hand-Painted Philippine Landscape",
    price: 3800,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    seller: "Sining Art Studio",
    category: "Art & Paintings",
    location: "Manila"
  },
  {
    id: "8",
    name: "Handmade Organic Soap Collection",
    price: 550,
    image: "https://images.unsplash.com/photo-1600857544200-b2f468e64d7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    seller: "Luntian Organics",
    category: "Soaps & Cosmetics",
    location: "Batangas"
  }
];

const categories = [
  {
    id: "1",
    name: "Textiles & Clothing",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2570&q=80",
    count: 42,
    slug: "textiles-clothing"
  },
  {
    id: "2",
    name: "Wooden Crafts",
    image: "https://images.unsplash.com/photo-1611486212557-88be5ff6f941?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80",
    count: 36,
    slug: "wooden-crafts"
  },
  {
    id: "3",
    name: "Pottery & Ceramics",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    count: 28,
    slug: "pottery-ceramics"
  },
  {
    id: "4",
    name: "Jewelry & Accessories",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2564&q=80",
    count: 34,
    slug: "jewelry-accessories"
  },
  {
    id: "5",
    name: "Home Decor",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2558&q=80",
    count: 45,
    slug: "home-decor"
  },
  {
    id: "6",
    name: "Food & Beverages",
    image: "https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    count: 24,
    slug: "food-beverages"
  }
];

const producers = [
  {
    id: "1",
    name: "Bahay Hablon",
    image: "https://images.unsplash.com/photo-1556760544-74068565f05c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80",
    location: "Iloilo",
    description: "Traditional Filipino textile workshop specializing in handwoven fabrics using indigenous materials and techniques passed down through generations.",
    productCount: 15
  },
  {
    id: "2",
    name: "Kalinga Woodcraft",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    location: "Baguio",
    description: "Family-run woodworking studio creating handcrafted wooden kitchen items, furniture, and decorative pieces using sustainable local hardwoods.",
    productCount: 22
  },
  {
    id: "3",
    name: "Binhi Pottery",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    location: "Laguna",
    description: "Ceramic studio founded by local artists creating contemporary pottery inspired by Philippine cultural heritage and natural surroundings.",
    productCount: 18
  }
];

const Index = () => {
  return (
    <Layout>
      <div className="animate-fade-in">
        <Hero />
        <FeaturedProducts 
          title="Featured Crafts" 
          subtitle="Discover our curated selection of handcrafted products from talented local artisans"
          products={featuredProducts}
        />
        <CategorySection 
          title="Shop by Category"
          subtitle="Browse our diverse range of locally-crafted products"
          categories={categories}
        />
        <ProducerSpotlight producers={producers} />
        <Features />
      </div>
    </Layout>
  );
};

export default Index;
