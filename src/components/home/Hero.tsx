
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, Package, HeartHandshake, Hammer, Leaf, Home, Palette } from 'lucide-react';

const Hero = () => {
  useEffect(() => {
    // Find and remove any overlays that might be auto-added
    const overlays = document.querySelectorAll('.lokalnest-intro-overlay, .hero-overlay, [class*="overlay"]');
    overlays.forEach(overlay => {
      if (overlay.classList.contains('bg-black') || 
          overlay.classList.contains('dark:bg-slate-900') || 
          overlay.classList.contains('dark:bg-background') || 
          overlay.classList.contains('from-black')) {
        // Skip our actual gradient overlay
        if (!overlay.closest('.relative.h-\\[90vh\\]')) {
          overlay.remove();
        }
      }
    });
    
    // Disable any potential scripts that might be creating these overlays
    const disableOverlayScripts = () => {
      // This will prevent theme previews from creating overlays
      window.localStorage.setItem('lokalnest-welcome-seen', 'true');
      window.localStorage.setItem('theme-preview-seen', 'true');
    };
    
    disableOverlayScripts();
  }, []);

  return (
    <section className="relative h-[90vh] max-h-[800px] min-h-[600px] w-full flex items-center z-0 overflow-visible">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6E59A5] via-[#9b87f5] to-[#fff] dark:from-[#1A1F2C] dark:to-[#6E59A5] transition-colors duration-700" />
      
      <div className="container mx-auto px-4 z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm w-fit px-4 py-2 rounded-full">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Local Artisan Marketplace</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Discover the Art of
              <span className="block bg-gradient-to-r from-[#D6BCFA] via-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
                Local Craftsmanship
              </span>
            </h1>

            <p className="text-lg text-white/90 max-w-xl">
              Explore unique handcrafted treasures from skilled artisans - from elegant pottery and ceramics 
              to intricate basket weaving and timeless home decor pieces.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-white text-[#6E59A5] hover:bg-white/90 transition-all duration-300 group"
              >
                <ShoppingBag className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Browse Collection
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                <HeartHandshake className="mr-2 h-5 w-5" />
                Meet Our Artisans
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Palette className="h-6 w-6 text-white mb-2" />
                <span className="text-white text-sm">Pottery & Ceramics</span>
              </div>
              <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Leaf className="h-6 w-6 text-white mb-2" />
                <span className="text-white text-sm">Basket Weaving</span>
              </div>
              <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Home className="h-6 w-6 text-white mb-2" />
                <span className="text-white text-sm">Home Decor</span>
              </div>
              <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <HeartHandshake className="h-6 w-6 text-white mb-2" />
                <span className="text-white text-sm">Artisan Support</span>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {/* Featured Product Cards */}
              <div className="transform -rotate-6 translate-x-4 translate-y-8">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"
                    alt="Handcrafted Pottery"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">Artisan Pottery</h3>
                    <p className="text-sm text-gray-600">Handcrafted with care</p>
                  </div>
                </div>
              </div>
              <div className="transform rotate-6 -translate-x-4">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1493962853295-0fd70327578a"
                    alt="Woven Baskets"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">Woven Baskets</h3>
                    <p className="text-sm text-gray-600">Traditional craftsmanship</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -right-8 bottom-6 w-[90px] h-[90px] rounded-full bg-gradient-to-tr from-[#D6BCFA] via-[#9b87f5]/30 to-[#fff]/30 opacity-60 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
