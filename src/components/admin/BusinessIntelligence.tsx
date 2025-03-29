
import React, { useState } from 'react';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Share2
} from 'lucide-react';

// Mock data for the charts
const salesData = [
  { month: 'Jan', sales: 4500, transactions: 120, revenue: 4500 },
  { month: 'Feb', sales: 5200, transactions: 145, revenue: 5200 },
  { month: 'Mar', sales: 4800, transactions: 132, revenue: 4800 },
  { month: 'Apr', sales: 6000, transactions: 168, revenue: 6000 },
  { month: 'May', sales: 7800, transactions: 210, revenue: 7800 },
  { month: 'Jun', sales: 9200, transactions: 245, revenue: 9200 },
  { month: 'Jul', sales: 8500, transactions: 225, revenue: 8500 },
  { month: 'Aug', sales: 9800, transactions: 260, revenue: 9800 },
  { month: 'Sep', sales: 11500, transactions: 285, revenue: 11500 },
  { month: 'Oct', sales: 10900, transactions: 270, revenue: 10900 },
  { month: 'Nov', sales: 12500, transactions: 310, revenue: 12500 },
  { month: 'Dec', sales: 15000, transactions: 375, revenue: 15000 },
];

const categoryData = [
  { name: 'Textiles & Clothing', value: 28, color: '#0088FE' },
  { name: 'Wooden Crafts', value: 22, color: '#00C49F' },
  { name: 'Pottery & Ceramics', value: 15, color: '#FFBB28' },
  { name: 'Jewelry & Accessories', value: 18, color: '#FF8042' },
  { name: 'Home Decor', value: 12, color: '#8884d8' },
  { name: 'Other', value: 5, color: '#82ca9d' },
];

const userEngagementData = [
  { month: 'Jan', visitors: 12500, signups: 450, returning: 3200 },
  { month: 'Feb', visitors: 15000, signups: 520, returning: 3800 },
  { month: 'Mar', visitors: 14000, signups: 480, returning: 4100 },
  { month: 'Apr', visitors: 18000, signups: 590, returning: 4500 },
  { month: 'May', visitors: 21000, signups: 680, returning: 5200 },
  { month: 'Jun', visitors: 25000, signups: 780, returning: 6100 },
];

const inventoryData = [
  { category: 'Textiles & Clothing', inStock: 145, lowStock: 28, outOfStock: 12 },
  { category: 'Wooden Crafts', inStock: 98, lowStock: 15, outOfStock: 8 },
  { category: 'Pottery & Ceramics', inStock: 76, lowStock: 22, outOfStock: 5 },
  { category: 'Jewelry & Accessories', inStock: 120, lowStock: 18, outOfStock: 10 },
  { category: 'Home Decor', inStock: 88, lowStock: 12, outOfStock: 6 },
  { category: 'Food & Beverages', inStock: 45, lowStock: 8, outOfStock: 3 },
];

const topSellersData = [
  { name: 'Artisan Woodworks', sales: 248, revenue: 12500, growth: 18 },
  { name: 'Traditional Textiles', sales: 215, revenue: 9800, growth: 12 },
  { name: 'Pottery Studio', sales: 187, revenue: 8750, growth: 9 },
  { name: 'Artisanal Jewelry', sales: 176, revenue: 12200, growth: 22 },
  { name: 'Natural Remedies', sales: 154, revenue: 5800, growth: -5 },
];

const BusinessIntelligence = () => {
  const [timeRange, setTimeRange] = useState('1y');
  const [chartType, setChartType] = useState('bar');
  
  // Stats data
  const stats = [
    {
      title: "Total Revenue",
      value: "₱96,200",
      change: "+23.1%",
      trend: "up"
    },
    {
      title: "Total Orders",
      value: "2,450",
      change: "+18.2%",
      trend: "up"
    },
    {
      title: "Avg. Order Value",
      value: "₱39.26",
      change: "+4.3%",
      trend: "up"
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "-0.4%",
      trend: "down"
    }
  ];

  // Filter data based on time range
  const getFilteredData = (data: any[], timeRange: string) => {
    switch (timeRange) {
      case '1m':
        return data.slice(-1);
      case '3m':
        return data.slice(-3);
      case '6m':
        return data.slice(-6);
      case '1y':
      default:
        return data;
    }
  };

  const filteredSalesData = getFilteredData(salesData, timeRange);
  const filteredUserData = getFilteredData(userEngagementData, timeRange);

  // Chart type selection
  const renderSalesChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={filteredSalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#9b87f5" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={filteredSalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#9b87f5" fill="#9b87f580" />
              <Area type="monotone" dataKey="sales" stroke="#82ca9d" fill="#82ca9d80" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={filteredSalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" fill="#9b87f5" name="Revenue" />
              <Bar dataKey="transactions" fill="#82ca9d" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-2">{stat.value}</h3>
                  <p className={`text-xs flex items-center mt-1 ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change} from last period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="sales">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
            <TabsTrigger value="products">Product Performance</TabsTrigger>
            <TabsTrigger value="users">User Engagement</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Revenue & Transactions</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={chartType === 'bar' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={chartType === 'line' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant={chartType === 'area' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderSalesChart()}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Categories</CardTitle>
                <CardDescription>Revenue distribution by category</CardDescription>
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Sellers</CardTitle>
                <CardDescription>Sellers with highest sales and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellersData.map((seller, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{seller.sales} sales</span>
                          <span>₱{seller.revenue} revenue</span>
                        </div>
                      </div>
                      <div className={`flex items-center ${
                        seller.growth > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {seller.growth > 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(seller.growth)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Sales and ratings across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inStock" stackId="a" fill="#8884d8" name="In Stock" />
                    <Bar dataKey="lowStock" stackId="a" fill="#82ca9d" name="Low Stock" />
                    <Bar dataKey="outOfStock" stackId="a" fill="#ffc658" name="Out of Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
              <CardDescription>Visitors, signups, and returning users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredUserData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visitors" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="signups" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="returning" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Current inventory levels across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inStock" fill="#8884d8" name="In Stock" />
                    <Bar dataKey="lowStock" fill="#82ca9d" name="Low Stock" />
                    <Bar dataKey="outOfStock" fill="#ffc658" name="Out of Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligence;
