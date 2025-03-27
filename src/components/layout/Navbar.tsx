
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X 
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const categories = [
  { name: "Fresh Produce", href: "/category/fresh-produce" },
  { name: "Dairy & Eggs", href: "/category/dairy-eggs" },
  { name: "Bakery", href: "/category/bakery" },
  { name: "Meat & Seafood", href: "/category/meat-seafood" },
  { name: "Honey & Preserves", href: "/category/honey-preserves" },
  { name: "Handcrafted", href: "/category/handcrafted" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled 
          ? "py-2 bg-white/90 backdrop-blur-md shadow-subtle" 
          : "py-4 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-xl md:text-2xl font-medium tracking-tight"
        >
          <span className="text-gradient">LocalNook</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium">
                  Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2">
                    {categories.map((category) => (
                      <li key={category.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={category.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              {category.name}
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/producers" className="flex items-center gap-1 text-sm font-medium">
                  Producers
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/about" className="flex items-center gap-1 text-sm font-medium">
                  About
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="w-5 h-5" />
          </Button>
          <Link to="/cart">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon" aria-label="Profile">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/auth" className="hidden md:block">
            <Button variant="default" size="sm" className="ml-4">
              Sign In
            </Button>
          </Link>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="py-6">
                    <h2 className="text-lg font-medium">Menu</h2>
                  </div>
                  <nav className="flex flex-col space-y-5">
                    <Link to="/" className="flex items-center py-2 text-base font-medium">
                      Home
                    </Link>
                    <div className="py-2">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Categories
                      </h3>
                      <div className="space-y-3">
                        {categories.map((category) => (
                          <Link 
                            key={category.name}
                            to={category.href}
                            className="block text-base py-1"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <Link to="/producers" className="flex items-center py-2 text-base font-medium">
                      Producers
                    </Link>
                    <Link to="/about" className="flex items-center py-2 text-base font-medium">
                      About
                    </Link>
                    <div className="flex-1"></div>
                    <Link to="/auth" className="w-full">
                      <Button className="w-full" size="default">
                        Sign In
                      </Button>
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
