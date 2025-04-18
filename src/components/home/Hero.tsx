import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  // Function to remove any potential overlays when the component mounts
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

  const scrollToProducts = () => {
    const productsSection = document.getElementById('featured-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-[90vh] max-h-[800px] min-h-[600px] w-full overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-black">
        <img
          src="/lovable-uploads/7d8f1f16-ac2a-44a7-9893-174cd3a3581d.png"
          alt="Handcrafted items from local producers"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-2xl animate-fade-in">
          <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm mb-6">
            Supporting Local Artisans
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Discover & Support Local Craftsmanship
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
            Connect with skilled artisans in your community. LokalNest brings authentic, handcrafted products directly from local creators to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 hover:text-black"
              onClick={scrollToProducts}
            >
              Explore Shop
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white bg-transparent hover:bg-white/10"
            >
              Meet Artisans
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
        <button
          onClick={scrollToProducts}
          className="text-white flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Scroll to products"
        >
          <span className="text-sm mb-2">Discover</span>
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Hero;
