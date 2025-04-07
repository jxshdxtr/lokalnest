import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X,
  LogOut
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
import CartSidebar from '@/components/buyer/shopping/CartSidebar';
import { useCart } from '@/components/buyer/shopping/Cart';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const categories = [
  { name: "Textiles & Clothing", href: "/category/textiles-clothing" },
  { name: "Wooden Crafts", href: "/category/wooden-crafts" },
  { name: "Pottery & Ceramics", href: "/category/pottery-ceramics" },
  { name: "Jewelry & Accessories", href: "/category/jewelry-accessories" },
  { name: "Home Decor", href: "/category/home-decor" },
  { name: "Food & Beverages", href: "/category/food-beverages" },
  { name: "Art & Paintings", href: "/category/art-paintings" },
  { name: "Soaps & Cosmetics", href: "/category/soaps-cosmetics" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
        <Link 
          to="/" 
          className="text-xl md:text-2xl font-medium tracking-tight"
        >
          <span className="text-gradient">LokalNest</span>
        </Link>

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
                <Link to="/artisans" className="flex items-center gap-1 text-sm font-medium">
                  Artisans
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

        <div className="flex items-center space-x-3">
          <Link to="/buyer/home">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          
          <CartSidebar>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </CartSidebar>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(user.user_metadata?.full_name || user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/buyer/orders')}>
                  Orders
                </DropdownMenuItem>
                {user.user_metadata?.account_type === 'seller' && (
                  <DropdownMenuItem onClick={() => navigate('/seller/dashboard')}>
                    Seller Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button variant="default" size="sm" className="ml-4">
                Sign In
              </Button>
            </Link>
          )}

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
                    <Link to="/artisans" className="flex items-center py-2 text-base font-medium">
                      Artisans
                    </Link>
                    <Link to="/about" className="flex items-center py-2 text-base font-medium">
                      About
                    </Link>
                    <Link to="/buyer/home" className="flex items-center py-2 text-base font-medium">
                      Shop
                    </Link>
                    <div className="flex-1"></div>
                    {!user ? (
                      <Link to="/auth" className="w-full">
                        <Button className="w-full" size="default">
                          Sign In
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link to="/profile" className="flex items-center py-2 text-base font-medium">
                          My Profile
                        </Link>
                        <Link to="/buyer/orders" className="flex items-center py-2 text-base font-medium">
                          My Orders
                        </Link>
                        {user.user_metadata?.account_type === 'seller' && (
                          <Link to="/seller/dashboard" className="flex items-center py-2 text-base font-medium">
                            Seller Dashboard
                          </Link>
                        )}
                        <Button onClick={handleSignOut} variant="outline" className="w-full">
                          Sign Out
                        </Button>
                      </>
                    )}
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
