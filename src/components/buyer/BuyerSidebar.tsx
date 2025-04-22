import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  ShoppingBag, 
  CreditCard, 
  Star, 
  MessageSquare,
  User,
  Home
} from 'lucide-react';

const BuyerSidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/buyer/dashboard', 
      icon: User,
      current: location.pathname === '/buyer/dashboard'
    },
    { 
      name: 'Home', 
      href: '/buyer/home', 
      icon: Home,
      current: location.pathname === '/buyer/home'
    },
    { 
      name: 'My Orders', 
      href: '/buyer/orders', 
      icon: ShoppingBag,
      current: location.pathname.includes('/buyer/orders')
    },
    { 
      name: 'Messages', 
      href: '/buyer/messages', 
      icon: MessageSquare,
      current: location.pathname.includes('/buyer/messages')
    },
    { 
      name: 'Payments', 
      href: '/buyer/payments', 
      icon: CreditCard,
      current: location.pathname.includes('/buyer/payments')
    },
    { 
      name: 'Reviews', 
      href: '/buyer/reviews', 
      icon: Star,
      current: location.pathname.includes('/buyer/reviews')
    },
    { 
      name: 'Support', 
      href: '/buyer/support', 
      icon: MessageSquare,
      current: location.pathname.includes('/buyer/support')
    },
  ];

  return (
    <div className="border-r border-border w-full md:w-64 flex-shrink-0 bg-background">
      <div className="sticky top-[72px]">
        <div className="p-4 md:p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Buyer Portal</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your orders and account</p>
        </div>
        <nav className="mt-2 px-2">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    item.current
                      ? "bg-accent text-primary dark:bg-accent dark:text-primary-foreground"
                      : "text-foreground hover:text-primary hover:bg-accent/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      item.current ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default BuyerSidebar;
