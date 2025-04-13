import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  Tag,
  Users,
  Settings,
  Star,
  BarChart2,
  Truck,
  Boxes,
  Menu,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  variant: 'default' | 'ghost';
  badge?: string;
};

interface SellerSidebarProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems: NavItem[] = [
    {
      title: 'Overview',
      href: '/seller/dashboard/overview',
      icon: <BarChart2 className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/overview' ? 'default' : 'ghost'
    },
    {
      title: 'Products',
      href: '/seller/dashboard/products',
      icon: <Package className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/products' ? 'default' : 'ghost'
    },
    {
      title: 'Inventory',
      href: '/seller/dashboard/inventory',
      icon: <Boxes className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/inventory' ? 'default' : 'ghost'
    },
    {
      title: 'Orders',
      href: '/seller/dashboard/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/orders' ? 'default' : 'ghost',
      badge: '3'
    },
    {
      title: 'Customers',
      href: '/seller/dashboard/customers',
      icon: <Users className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/customers' ? 'default' : 'ghost'
    },
    {
      title: 'Promotions',
      href: '/seller/dashboard/promotions',
      icon: <Tag className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/promotions' ? 'default' : 'ghost'
    },
    {
      title: 'Logistics',
      href: '/seller/dashboard/logistics',
      icon: <Truck className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/logistics' ? 'default' : 'ghost'
    },
    {
      title: 'Reviews',
      href: '/seller/dashboard/reviews',
      icon: <Star className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/reviews' ? 'default' : 'ghost'
    },
    {
      title: 'Settings',
      href: '/seller/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
      variant: currentPath === '/seller/dashboard/settings' ? 'default' : 'ghost'
    }
  ];

  return (
    <div className="pb-12 border rounded-lg">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-semibold">{user.name}</h2>
              <div className="flex items-center">
                {user.verified ? (
                  <Badge className="text-xs bg-green-100 text-green-800 border-green-300 hover:bg-green-200 flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-yellow-800 bg-yellow-100 border-yellow-300 hover:bg-yellow-200 flex items-center cursor-pointer" onClick={() => navigate('/seller-verification')}>
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {!user.verified && (
          <div className="mx-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              Your account is not verified. You need to upload your DTI Certificate to list products.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full text-xs border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              onClick={() => navigate('/seller-verification')}
            >
              Verify Your Account
            </Button>
          </div>
        )}
        
        <div className="px-4">
          <p className="text-xs text-muted-foreground mb-1">
            Store Dashboard
          </p>
        </div>
        <div className="px-2">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item, i) => (
              <Link key={i} to={item.href}>
                <Button
                  variant={item.variant}
                  className={cn(
                    "w-full justify-start",
                    item.variant === 'default' &&
                    "bg-muted hover:bg-muted text-primary hover:text-primary"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                  {item.badge && (
                    <Badge className="ml-auto" variant="default">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SellerSidebar;
