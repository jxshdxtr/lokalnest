
import React, { useState } from 'react';
import {
  Search,
  Mail,
  Phone,
  User,
  ShoppingBag,
  MessageSquare,
  FileText,
  Calendar,
  Tag,
  Filter,
  MoreHorizontal,
  Send,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';

// Sample customer data
const initialCustomers = [
  {
    id: 'cust001',
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '+63 912 345 6789',
    location: 'Makati City',
    totalOrders: 5,
    totalSpent: 3850,
    lastOrderDate: '2023-06-15',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
  },
  {
    id: 'cust002',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '+63 919 876 5432',
    location: 'Quezon City',
    totalOrders: 3,
    totalSpent: 2450,
    lastOrderDate: '2023-06-14',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
  },
  {
    id: 'cust003',
    name: 'Pedro Gomez',
    email: 'pedro@example.com',
    phone: '+63 917 555 1234',
    location: 'Manila',
    totalOrders: 2,
    totalSpent: 1870,
    lastOrderDate: '2023-06-14',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
  },
  {
    id: 'cust004',
    name: 'Sofia Garcia',
    email: 'sofia@example.com',
    phone: '+63 920 123 4567',
    location: 'Cavite',
    totalOrders: 1,
    totalSpent: 1200,
    lastOrderDate: '2023-06-13',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: 'cust005',
    name: 'Roberto Lim',
    email: 'roberto@example.com',
    phone: '+63 995 555 7890',
    location: 'Davao City',
    totalOrders: 1,
    totalSpent: 1650,
    lastOrderDate: '2023-06-12',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
  }
];

// Sample message templates
const messageTemplates = [
  {
    id: 'temp1',
    name: 'Order Confirmation',
    subject: 'Your Order Has Been Confirmed',
    content: 'Dear {{customerName}},\n\nThank you for your order! We\'re pleased to confirm that your order #{{orderNumber}} has been received and is being processed.\n\nYou can track your order status through your account.\n\nBest regards,\nThe Artisan Crafts Team'
  },
  {
    id: 'temp2',
    name: 'Shipping Notification',
    subject: 'Your Order Has Been Shipped',
    content: 'Dear {{customerName}},\n\nGreat news! Your order #{{orderNumber}} has been shipped and is on its way to you!\n\nTracking Number: {{trackingNumber}}\n\nYou can track your package\'s journey using the link below:\n{{trackingLink}}\n\nBest regards,\nThe Artisan Crafts Team'
  },
  {
    id: 'temp3',
    name: 'Thank You',
    subject: 'Thank You for Your Purchase',
    content: 'Dear {{customerName}},\n\nThank you for your recent purchase! We hope you love your handcrafted items.\n\nWe would appreciate it if you could take a moment to leave a review on our website.\n\nBest regards,\nThe Artisan Crafts Team'
  },
  {
    id: 'temp4',
    name: 'Special Offer',
    subject: 'Special Offer Just for You',
    content: 'Dear {{customerName}},\n\nAs a valued customer, we\'re delighted to offer you a special 15% discount on your next purchase. Simply use the code ARTISAN15 at checkout.\n\nValid until {{expiryDate}}.\n\nBest regards,\nThe Artisan Crafts Team'
  }
];

const CustomerManagement = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter(customer => {
    // Filter by search term
    const searchMatch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const statusMatch = statusFilter === 'all' || customer.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  const openMessageDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setMessageSubject('');
    setMessageContent('');
    setSelectedTemplate('');
    setIsMessageDialogOpen(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId && selectedCustomer) {
      const template = messageTemplates.find(t => t.id === templateId);
      if (template) {
        setMessageSubject(template.subject);
        
        // Replace placeholders with actual customer data
        let content = template.content
          .replace('{{customerName}}', selectedCustomer.name)
          .replace('{{orderNumber}}', 'ORD-' + Math.floor(Math.random() * 10000))
          .replace('{{trackingNumber}}', 'TRK' + Math.floor(Math.random() * 1000000))
          .replace('{{trackingLink}}', 'https://tracking.example.com/' + Math.floor(Math.random() * 1000000))
          .replace('{{expiryDate}}', new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString());
        
        setMessageContent(content);
      }
    }
  };

  const sendMessage = () => {
    if (!messageSubject || !messageContent) {
      toast.error("Please enter both subject and message content");
      return;
    }
    
    // Here you would integrate with your email service
    // For now, we'll just show a success toast
    toast.success(`Message sent to ${selectedCustomer.name}`);
    setIsMessageDialogOpen(false);
  };

  const downloadCustomerData = () => {
    toast.success("Customer data export started. File will be ready for download shortly.");
    
    // Here you would implement actual export functionality
    setTimeout(() => {
      toast.success("Customer data export completed!");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers">Customer Management</TabsTrigger>
          <TabsTrigger value="communications">Communication Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 w-full sm:w-[300px]"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={downloadCustomerData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="p-3 text-sm font-medium">Customer</th>
                      <th className="p-3 text-sm font-medium">Contact</th>
                      <th className="p-3 text-sm font-medium">Location</th>
                      <th className="p-3 text-sm font-medium">Orders</th>
                      <th className="p-3 text-sm font-medium">Total Spent</th>
                      <th className="p-3 text-sm font-medium">Last Order</th>
                      <th className="p-3 text-sm font-medium">Status</th>
                      <th className="p-3 text-sm font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              <img 
                                src={customer.avatar} 
                                alt={customer.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {customer.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                              {customer.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{customer.location}</td>
                        <td className="p-3 text-sm">{customer.totalOrders}</td>
                        <td className="p-3 text-sm font-medium">₱{customer.totalSpent.toFixed(2)}</td>
                        <td className="p-3 text-sm">{customer.lastOrderDate}</td>
                        <td className="p-3 text-sm">
                          <Badge 
                            variant="outline" 
                            className={customer.status === 'active' ? 
                              'bg-green-100 text-green-800 border-green-200' : 
                              'bg-gray-100 text-gray-800 border-gray-200'}
                          >
                            {customer.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openMessageDialog(customer)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <User className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ShoppingBag className="h-4 w-4 mr-2" />
                                  View Orders
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Notes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Tag className="h-4 w-4 mr-2" />
                                  Add Tag
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-muted-foreground">
                          No customers found. Try adjusting your search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communications" className="space-y-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Message Templates</h3>
                  <div className="space-y-4">
                    {messageTemplates.map((template) => (
                      <Card key={template.id} className="p-4 cursor-pointer hover:bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setMessageSubject(template.subject);
                              setMessageContent(template.content);
                              setSelectedTemplate(template.id);
                            }}
                          >
                            Use Template
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">New Message</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">To</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Subject</label>
                      <Input 
                        value={messageSubject} 
                        onChange={(e) => setMessageSubject(e.target.value)}
                        placeholder="Message subject"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Message</label>
                      <Textarea 
                        value={messageContent} 
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your message here..."
                        rows={8}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              Compose your message or use a template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Use Template</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Custom Message)</SelectItem>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Subject</label>
              <Input 
                value={messageSubject} 
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter message subject"
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                value={messageContent} 
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                rows={10}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
