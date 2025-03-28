
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Percent, 
  Users, 
  Settings, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const pathname = location.pathname;

  const isActive = (path: string) => {
    return pathname.includes(path);
  };
  
  const navigation = [
    {
      title: 'Dashboard',
      href: '/seller/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: 'Products',
      href: '/seller/products',
      icon: <Package className="w-5 h-5" />,
    },
    {
      title: 'Orders',
      href: '/seller/orders',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      title: 'Promotions',
      href: '/seller/promotions',
      icon: <Percent className="w-5 h-5" />,
    },
    {
      title: 'Customers',
      href: '/seller/customers',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Messages',
      href: '/seller/messages',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: '3'
    },
    {
      title: 'Settings',
      href: '/seller/settings',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      title: 'Help Center',
      href: '/seller/help',
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <Card className="p-4 rounded-lg h-full">
      <div className="flex flex-col space-y-6">
        {/* Seller Profile */}
        <div className="flex items-center space-x-3 pb-4 border-b">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{user.name}</h3>
              {user.verified && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Seller ID: {user.id}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </Card>
  );
};

export default SellerSidebar;
