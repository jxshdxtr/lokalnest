
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircleUser,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell 
} from 'recharts';

const AdminOverview = () => {
  // Mock data for overview statistics
  const stats = [
    {
      title: "Total Users",
      value: "5,243",
      change: "+12%",
      trend: "up",
      icon: <CircleUser className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Products",
      value: "1,876",
      change: "+8%",
      trend: "up",
      icon: <ShoppingBag className="h-5 w-5 text-indigo-500" />
    },
    {
      title: "Revenue",
      value: "$152,492",
      change: "+23%",
      trend: "up",
      icon: <DollarSign className="h-5 w-5 text-green-500" />
    },
    {
      title: "Issues",
      value: "12",
      change: "-5%",
      trend: "down",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
  ];

  // Mock data for sales chart
  const salesData = [
    { name: 'Jan', value: 2500 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2800 },
    { name: 'Apr', value: 3500 },
    { name: 'May', value: 3700 },
    { name: 'Jun', value: 4500 },
    { name: 'Jul', value: 4200 },
    { name: 'Aug', value: 5000 },
    { name: 'Sep', value: 5200 },
    { name: 'Oct', value: 4800 },
    { name: 'Nov', value: 5500 },
    { name: 'Dec', value: 6000 },
  ];

  // Mock data for user growth
  const userGrowthData = [
    { name: 'Jan', sellers: 20, buyers: 120 },
    { name: 'Feb', sellers: 25, buyers: 150 },
    { name: 'Mar', sellers: 30, buyers: 180 },
    { name: 'Apr', sellers: 35, buyers: 220 },
    { name: 'May', sellers: 40, buyers: 250 },
    { name: 'Jun', sellers: 48, buyers: 280 },
  ];
  
  // Mock data for product categories
  const categoryData = [
    { name: 'Textiles', value: 30 },
    { name: 'Wooden Crafts', value: 25 },
    { name: 'Pottery', value: 20 },
    { name: 'Jewelry', value: 15 },
    { name: 'Other', value: 10 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-2">{stat.value}</h3>
                  <p className={`text-xs flex items-center mt-1 ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                    )}
                    {stat.change} from last month
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']} 
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="value" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Sellers vs Buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sellers" stroke="#9b87f5" strokeWidth={2} />
                  <Line type="monotone" dataKey="buyers" stroke="#33C3F0" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "New seller verification request",
                  description: "Artisan Wood Crafts applied for seller verification",
                  time: "10 minutes ago",
                  icon: <Clock className="h-4 w-4" />
                },
                {
                  title: "Product flagged for review",
                  description: "Handmade Pottery Bowl was flagged by 3 users",
                  time: "1 hour ago",
                  icon: <AlertTriangle className="h-4 w-4" />
                },
                {
                  title: "Large order placed",
                  description: "Order #4582 - $1,250.00 was placed",
                  time: "3 hours ago",
                  icon: <ShoppingBag className="h-4 w-4" />
                },
                {
                  title: "New category suggested",
                  description: "Suggestion for 'Sustainable Crafts' category",
                  time: "5 hours ago",
                  icon: <CircleUser className="h-4 w-4" />
                }
              ].map((activity, i) => (
                <div key={i} className="flex items-start">
                  <div className="mr-4 p-2 bg-muted rounded-full">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
