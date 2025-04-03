
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TagsIcon,
  Star,
  ClipboardList,
  Settings,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface SellerSidebarProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

const SellerSidebar = ({ user }: SellerSidebarProps) => {
  const location = useLocation();
  const getPath = () => location.pathname.split('/').pop() || 'overview';
  const path = getPath();

  const links = [
    { name: 'Overview', path: 'overview', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { name: 'Products', path: 'products', icon: <Package className="h-4 w-4 mr-2" /> },
    { name: 'Inventory', path: 'inventory', icon: <ClipboardList className="h-4 w-4 mr-2" /> },
    { name: 'Orders', path: 'orders', icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
    { name: 'Customers', path: 'customers', icon: <Users className="h-4 w-4 mr-2" /> },
    { name: 'Promotions', path: 'promotions', icon: <TagsIcon className="h-4 w-4 mr-2" /> },
    { name: 'Reviews', path: 'reviews', icon: <Star className="h-4 w-4 mr-2" /> },
    { name: 'Store Settings', path: 'settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    { name: 'Profile', path: 'profile', icon: <UserCircle className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center gap-1">
              {user.name}
              {user.verified && (
                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5 ml-1">
                  Verified
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">Seller Account</div>
          </div>
        </div>

        <div className="space-y-1">
          {links.map((link) => (
            <Button
              key={link.path}
              variant={path === link.path ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                path === link.path ? '' : 'text-muted-foreground'
              )}
              asChild
            >
              <Link to={`/seller/${link.path}`}>
                {link.icon}
                {link.name}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto">
        <Separator />
        <div className="p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            asChild
          >
            <Link to="/">
              Visit Store
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SellerSidebar;
