
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  ShoppingBag, 
  CreditCard, 
  Star, 
  MessageSquare,
  User
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
      name: 'My Orders', 
      href: '/buyer/orders', 
      icon: ShoppingBag,
      current: location.pathname.includes('/buyer/orders')
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
    <div className="border-r border-gray-200 w-full md:w-64 flex-shrink-0">
      <div className="p-4 md:p-6">
        <h2 className="text-xl font-semibold">Buyer Portal</h2>
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
                    ? "bg-gray-100 text-primary"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    item.current ? "text-primary" : "text-gray-500 group-hover:text-primary"
                  )}
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default BuyerSidebar;
