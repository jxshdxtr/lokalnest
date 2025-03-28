
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Star,
  Truck,
  ArrowLeft,
  Plus,
  Minus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// In a real app, you would fetch this data from an API
const productData = {
  id: "1",
  name: "Handwoven Cotton Tote Bag",
  description: "This beautiful tote bag is handwoven by skilled artisans using traditional techniques. Made from 100% locally sourced cotton with natural dyes, each piece showcases unique patterns inspired by Philippine indigenous textiles. Perfect for everyday use, this bag combines functionality with cultural artistry.",
  price: 850,
  discountPrice: null,
  stock: 15,
  rating: 4.8,
  reviews: 24,
  location: "Iloilo",
  seller: {
    id: "1",
    name: "Bahay Hablon",
    image: "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=150&q=80",
    rating: 4.9,
    products: 15,
  },
  category: "Textiles & Clothing",
  images: [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2670&q=80",
    "https://images.unsplash.com/photo-1547619292-8816ee7cdd50?auto=format&fit=crop&w=2670&q=80",
    "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=2670&q=80",
    "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=2670&q=80",
  ],
  details: [
    { name: "Materials", value: "100% Cotton" },
    { name: "Dimensions", value: "35cm x 40cm x 10cm" },
    { name: "Weight", value: "320g" },
    { name: "Care", value: "Hand wash with mild soap, air dry" },
    { name: "Origin", value: "Handcrafted in Iloilo, Philippines" },
  ],
  deliveryOptions: [
    { name: "Standard Delivery", value: "2-3 business days", fee: 80 },
    { name: "Express Delivery", value: "Next-day delivery", fee: 150 },
  ],
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [mainImage, setMainImage] = useState(productData.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  // In a real app, you would fetch the product by ID from an API
  // const product = fetchProductById(id);
  const product = productData;

  const handleAddToCart = () => {
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleAddToWishlist = () => {
    toast.success(`${product.name} added to wishlist!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16 animate-fade-in">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to={`/category/${productData.category.toLowerCase().replace(/ & /g, '-')}`} className="hover:text-foreground">
              {productData.category}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground">{productData.name}</span>
          </nav>
        </div>

        {/* Product content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-white rounded-lg border border-border">
              {isLoadingImages && (
                <div className="absolute inset-0 loading-shimmer" />
              )}
              <img 
                src={mainImage} 
                alt={productData.name} 
                className={cn(
                  "w-full h-full object-contain",
                  isLoadingImages ? "opacity-0" : "opacity-100 transition-opacity duration-300"
                )}
                onLoad={() => setIsLoadingImages(false)}
              />
            </div>
            {/* Image thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border transition-all duration-200",
                    mainImage === image 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-gray-300"
                  )}
                  onClick={() => setMainImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`${productData.name} - Image ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <Link 
                to={`/artisan/${productData.seller.id}`}
                className="text-sm text-blue-light hover:underline inline-flex items-center gap-1"
              >
                {productData.seller.name}
              </Link>
              <h1 className="text-3xl font-semibold mt-1">{productData.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 text-sm font-medium">{productData.rating}</span>
                </div>
                <span className="mx-2 text-muted-foreground">•</span>
                <Link to="#reviews" className="text-sm text-muted-foreground hover:text-foreground">
                  {productData.reviews} reviews
                </Link>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {productData.stock > 0 ? 'In stock' : 'Out of stock'}
                </span>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div>
              {productData.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">₱{productData.discountPrice.toFixed(2)}</span>
                  <span className="text-lg text-muted-foreground line-through">₱{productData.price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                    {Math.round((1 - productData.discountPrice / productData.price) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-semibold">₱{productData.price.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{productData.description}</p>

            {/* Add to cart section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex items-center border border-border rounded-md mr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="h-10 w-10 rounded-none rounded-l-md"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="h-10 w-16 flex items-center justify-center border-l border-r border-border">
                    {quantity}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= productData.stock}
                    aria-label="Increase quantity"
                    className="h-10 w-10 rounded-none rounded-r-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {productData.stock} available
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={productData.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={handleAddToWishlist}
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={handleShare}
                    aria-label="Share product"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Seller info */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center">
                <img
                  src={productData.seller.image}
                  alt={productData.seller.name}
                  className="h-12 w-12 rounded-full object-cover border border-border mr-3"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{productData.seller.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{productData.seller.rating} • {productData.seller.products} products</span>
                  </div>
                </div>
                <Link to={`/artisan/${productData.seller.id}`}>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Delivery options */}
            <div>
              <h3 className="font-medium mb-3">Delivery Options</h3>
              <div className="space-y-2">
                {productData.deliveryOptions.map((option, index) => (
                  <div key={index} className="flex items-start p-3 rounded-md border border-border">
                    <Truck className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.value} • ₱{option.fee.toFixed(2)} shipping fee
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product details/specifications */}
            <div>
              <h3 className="font-medium mb-3">Product Details</h3>
              <div className="space-y-1">
                {productData.details.map((detail, index) => (
                  <div key={index} className="flex py-2 border-b border-border last:border-0">
                    <span className="w-1/3 text-muted-foreground">{detail.name}</span>
                    <span className="w-2/3">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-blue-light hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
