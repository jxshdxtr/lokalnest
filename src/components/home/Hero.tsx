import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Computer, Smartphone, ShoppingCart } from 'lucide-react';

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
    <section className="relative h-[90vh] max-h-[800px] min-h-[600px] w-full flex items-center z-0 overflow-visible">
      {/* Gradient background and top right orb */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6E59A5] via-[#9b87f5] to-[#fff] dark:from-[#1A1F2C] dark:to-[#6E59A5] transition-colors duration-700" />
      <div className="absolute right-0 top-0 w-1/3 h-2/3 bg-gradient-to-br from-pink-400 via-purple-400 to-transparent opacity-30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 top-0 w-full h-full opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(135deg,rgba(255,255,255,0.04) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0.04) 75%,transparent 75%,transparent)',
          backgroundSize: '60px 60px'
        }}
      />
      <div className="container mx-auto px-4 z-10 h-full relative flex flex-col md:flex-row items-center justify-between">
        {/* Left content */}
        <div className="max-w-xl py-12 md:py-0 flex-1 flex flex-col justify-center animate-fade-in">
          <div className="inline-block px-5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm text-white mb-6">
            Supporting Local Artisans
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-2 text-white drop-shadow-[0_2px_10px_rgba(110,89,165,0.20)]">
            Discover & Support
            <span className="block bg-gradient-to-r from-[#D6BCFA] via-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
              Local Craftsmanship
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
            Connect with skilled artisans in your community. LokalNest brings authentic, handcrafted products directly from local creators to your doorstep.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-pink-500 text-white shadow-lg hover:bg-pink-400 transition hover:scale-105"
              onClick={scrollToProducts}
            >
              Shop Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white bg-transparent hover:bg-white/10 hover:scale-105 transition"
            >
              Meet Artisans
            </Button>
          </div>
        </div>
        {/* Right illustration */}
        <div className="hidden md:flex flex-1 justify-center items-center relative h-[450px] w-full max-w-lg">
          {/* Main device (laptop) */}
          <div className="absolute left-[55px] top-[120px] z-20 bg-gradient-to-tr from-[#9b87f5]/80 to-[#fff]/60 rounded-3xl shadow-xl p-6 flex flex-col items-center border-2 border-white/10 min-w-[220px] min-h-[120px]">
            <Computer size={65} strokeWidth={1.7} className="text-[#6E59A5]" />
            <div className="mt-2 text-xs font-bold uppercase text-[#7E69AB] tracking-widest">
              Online Handmade
            </div>
          </div>
          {/* Shopping bags */}
          <div className="absolute left-0 top-[170px] z-10 flex gap-1">
            <div className="w-20 h-28 bg-gradient-to-br from-pink-400 via-pink-300 to-white rounded-lg shadow-lg relative">
              <ShoppingBag size={38} strokeWidth={1.2} className="text-white absolute left-4 top-7" />
            </div>
            <div className="w-12 h-16 bg-gradient-to-br from-[#D6BCFA] via-[#9b87f5] to-[#6E59A5] rounded-lg shadow-lg mt-6 ml-2 flex items-center justify-center">
              <ShoppingBag size={18} strokeWidth={1.2} className="text-white" />
            </div>
          </div>
          {/* Smartphone with cart */}
          <div className="absolute right-0 bottom-12 z-20 flex flex-col items-center">
            <div className="w-28 h-56 bg-gradient-to-br from-[#fff4] via-[#9b87f5] to-[#6E59A5] rounded-2xl shadow-lg border-2 border-white/10 flex flex-col items-center justify-end pb-8 relative">
              <Smartphone size={52} strokeWidth={1.3} className="absolute left-1/2 top-7 -translate-x-1/2 text-[#6E59A5]" />
              <div className="z-10 bg-pink-500 text-white px-2 py-1 rounded-full text-xs absolute bottom-14 left-1/2 -translate-x-1/2 font-semibold">
                Shop Now
              </div>
              <div className="absolute right-0 left-0 bottom-5 flex justify-center">
                <ShoppingCart size={26} strokeWidth={1.6} className="text-white drop-shadow-md" />
              </div>
            </div>
          </div>
          {/* Decorative gradient circle */}
          <div className="absolute -right-8 bottom-6 w-[90px] h-[90px] rounded-full bg-gradient-to-tr from-[#D6BCFA] via-[#9b87f5]/30 to-[#fff]/30 opacity-60 blur-2xl" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

