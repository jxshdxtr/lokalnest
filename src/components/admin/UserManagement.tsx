
import React, { useState } from 'react';
import { 
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Edit,
  Trash,
  Shield,
  User,
  Store,
  MoreHorizontal 
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    type: 'seller',
    status: 'verified',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    joined: '2 months ago',
    listings: 24,
    sales: '$4,500',
    rating: 4.8,
    permissions: ['create_product', 'manage_orders', 'view_analytics'],
    verificationDetails: {
      documentType: 'Business License',
      documentId: 'BL-78945612',
      verifiedDate: '2023-05-15',
      verifiedBy: 'Admin System'
    }
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    type: 'buyer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    joined: '5 months ago',
    purchases: 12,
    spent: '$1,250',
    permissions: ['make_purchase', 'write_reviews'],
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    type: 'seller',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    joined: '1 week ago',
    listings: 5,
    sales: '$350',
    rating: 0,
    permissions: ['create_product'],
    verificationDetails: {
      documentType: 'ID Verification',
      documentId: 'Pending Review',
      verifiedDate: null,
      verifiedBy: null
    }
  },
  {
    id: '4',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    type: 'buyer',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    joined: '1 year ago',
    purchases: 3,
    spent: '$120',
    permissions: ['make_purchase', 'write_reviews'],
  },
  {
    id: '5',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    type: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    joined: '1 year ago',
    permissions: ['manage_users', 'manage_products', 'manage_analytics', 'manage_security', 'manage_logistics'],
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = userTypeFilter === 'all' || user.type === userTypeFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleUserVerification = (userId: string, status: 'verified' | 'rejected') => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user, 
          status: status === 'verified' ? 'verified' : 'rejected',
          verificationDetails: user.verificationDetails ? {
            ...user.verificationDetails,
            verifiedDate: new Date().toISOString().split('T')[0],
            verifiedBy: 'Current Admin'
          } : undefined
        };
      }
      return user;
    }));

    toast({
      title: `User ${status === 'verified' ? 'Verified' : 'Rejected'}`,
      description: `User has been ${status === 'verified' ? 'verified' : 'rejected'} successfully.`,
      variant: status === 'verified' ? 'default' : 'destructive',
    });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, type: newRole };
      }
      return user;
    }));

    toast({
      title: "Role Updated",
      description: `User role changed to ${newRole}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
      variant: "destructive",
    });
  };

  const showUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'active':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'seller':
        return <Store className="h-4 w-4 text-indigo-500" />;
      case 'buyer':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage sellers, buyers, and admin accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-auto flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="seller">Sellers</SelectItem>
                      <SelectItem value="buyer">Buyers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="pending">Pending Verification</TabsTrigger>
                <TabsTrigger value="recent">Recently Added</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getUserTypeIcon(user.type)}
                              <span className="capitalize">{user.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.joined}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {user.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleUserVerification(user.id, 'verified')}
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleUserVerification(user.id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => showUserDetails(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => showUserDetails(user)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setIsEditPermissionsOpen(true)}>
                                    Edit Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-500">
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.status === 'pending').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No pending verifications
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.filter(u => u.status === 'pending').map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.verificationDetails?.documentType || 'Unknown'}</TableCell>
                          <TableCell>{user.joined}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-500 border-green-500"
                                onClick={() => handleUserVerification(user.id, 'verified')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-500"
                                onClick={() => handleUserVerification(user.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="recent" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Show only recent users (for demo, using the first 3) */}
                    {users.slice(0, 3).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getUserTypeIcon(user.type)}
                            <span className="capitalize">{user.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => showUserDetails(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View and edit user information</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getUserTypeIcon(selectedUser.type)}
                      <span className="capitalize">{selectedUser.type}</span>
                    </Badge>
                    {getUserStatusBadge(selectedUser.status)}
                    <Badge variant="secondary">Joined {selectedUser.joined}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Account Type</h4>
                  <Select 
                    defaultValue={selectedUser.type}
                    onValueChange={(value) => handleRoleChange(selectedUser.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser.type === 'seller' && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Seller Statistics</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-xs text-muted-foreground">Listings</p>
                          <p className="text-lg font-medium">{selectedUser.listings}</p>
                        </div>
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-xs text-muted-foreground">Sales</p>
                          <p className="text-lg font-medium">{selectedUser.sales}</p>
                        </div>
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="text-lg font-medium">{selectedUser.rating || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {selectedUser.verificationDetails && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Verification Details</h4>
                        <div className="bg-muted p-3 rounded-md space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Document Type:</span>
                            <span className="text-sm font-medium">{selectedUser.verificationDetails.documentType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Document ID:</span>
                            <span className="text-sm font-medium">{selectedUser.verificationDetails.documentId}</span>
                          </div>
                          {selectedUser.verificationDetails.verifiedDate && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Verified Date:</span>
                                <span className="text-sm font-medium">{selectedUser.verificationDetails.verifiedDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Verified By:</span>
                                <span className="text-sm font-medium">{selectedUser.verificationDetails.verifiedBy}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedUser.type === 'buyer' && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Buyer Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Purchases</p>
                        <p className="text-lg font-medium">{selectedUser.purchases}</p>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                        <p className="text-lg font-medium">{selectedUser.spent}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.permissions.map((permission: string) => (
                      <Badge key={permission} variant="outline">
                        {permission.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2 p-0" 
                    onClick={() => {
                      setIsUserDetailsOpen(false);
                      setIsEditPermissionsOpen(true);
                    }}
                  >
                    Edit Permissions
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsUserDetailsOpen(false)}>
              Close
            </Button>
            {selectedUser && selectedUser.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-green-500 border-green-500"
                  onClick={() => {
                    handleUserVerification(selectedUser.id, 'verified');
                    setIsUserDetailsOpen(false);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500"
                  onClick={() => {
                    handleUserVerification(selectedUser.id, 'rejected');
                    setIsUserDetailsOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Manage user permissions and access controls
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Permission groups would go here */}
            <p className="text-sm text-muted-foreground">
              This functionality would allow admins to assign granular permissions to users based on their roles and responsibilities.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPermissionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditPermissionsOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
