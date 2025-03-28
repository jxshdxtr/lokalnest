
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, ShoppingBag, BarChart2, Shield, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    permissions?: string[];
  };
}

const AdminSidebar = ({ user }: AdminSidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: <Home className="mr-2 h-4 w-4" />,
      exact: true
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: <Users className="mr-2 h-4 w-4" />,
      permission: 'manage_users'
    },
    {
      name: 'Product Oversight',
      href: '/admin/products',
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
      permission: 'manage_products'
    },
    {
      name: 'Business Intelligence',
      href: '/admin/analytics',
      icon: <BarChart2 className="mr-2 h-4 w-4" />,
      permission: 'manage_analytics'
    },
    {
      name: 'Security & Compliance',
      href: '/admin/security',
      icon: <Shield className="mr-2 h-4 w-4" />,
      permission: 'manage_security'
    },
    {
      name: 'Delivery & Logistics',
      href: '/admin/logistics',
      icon: <Truck className="mr-2 h-4 w-4" />,
      permission: 'manage_logistics'
    }
  ];

  const isRouteActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return user.permissions?.includes(item.permission);
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3 mb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <Badge variant="outline" className="text-xs font-normal">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
        </div>
        <CardDescription>Manage your marketplace platform</CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <nav className="flex flex-col space-y-1">
          {filteredMenuItems.map((item) => (
            <Link key={item.name} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isRouteActive(item.href, item.exact) && "bg-accent text-accent-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full">
          Logout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminSidebar;
