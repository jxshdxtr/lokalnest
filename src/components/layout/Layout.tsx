import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  
  // Apply a class to the main container based on the current theme
  useEffect(() => {
    // Update body's data-theme attribute for components that might use it
    document.body.setAttribute('data-theme', resolvedTheme || 'light');
  }, [resolvedTheme]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16 bg-background text-foreground">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default Layout;
