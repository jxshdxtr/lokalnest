import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle2, 
  XCircle,
  Search, 
  FileText,
  Filter,
  ExternalLink
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VerificationDocumentType {
  id: string;
  seller_id: string;
  document_type: string;
  document_url: string;
  dti_certification_number: string;
  dti_certification_expiry: string;
  status: string;
  created_at: string;
  business_name: string;
  notes: string;
  verification_date?: string;
  verified_by?: string;
}

const SellerVerificationManagement = () => {
  const [verifications, setVerifications] = useState<VerificationDocumentType[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationDocumentType | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('seller_verifications')
        .select(`
          *,
          seller_profiles!inner (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVerifications(data?.map(item => ({
        ...item,
        business_name: item.seller_profiles.business_name
      })) || []);
    } catch (error: any) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleViewVerification = async (verification: VerificationDocumentType) => {
    setSelectedVerification(verification);
    setIsVerificationModalOpen(true);
    
    try {
      const { data, error } = await supabase
        .storage
        .from('seller_documents')
        .createSignedUrl(verification.document_url, 60);
      
      if (error) {
        throw error;
      }
      
      setDocumentPreviewUrl(data.signedUrl);
    } catch (err) {
      console.error('Error creating signed URL:', err);
      setDocumentPreviewUrl(null);
      toast.error('Could not generate document preview link');
    }
  };

  const handleApproveVerification = async () => {
    if (!selectedVerification) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const { error: verificationError } = await supabase
        .from('seller_verifications')
        .update({
          status: 'approved',
          verified_by: session.user.id,
          verification_date: new Date().toISOString(),
          notes: 'Approved by admin'
        })
        .eq('id', selectedVerification.id);
        
      if (verificationError) throw verificationError;
      
      const { error: profileError } = await supabase
        .from('seller_profiles')
        .update({
          is_verified: true
        })
        .eq('id', selectedVerification.seller_id);
        
      if (profileError) throw profileError;
      
      toast.success(`Seller ${selectedVerification.business_name} has been verified`);
      setIsVerificationModalOpen(false);
      fetchVerifications();
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve seller verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectVerification = async () => {
    if (!selectedVerification) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('seller_verifications')
        .update({
          status: 'rejected',
          verified_by: session.user.id,
          verification_date: new Date().toISOString(),
          notes: rejectionReason
        })
        .eq('id', selectedVerification.id);
        
      if (error) throw error;
      
      toast.success(`Seller verification for ${selectedVerification.business_name} has been rejected`);
      setIsVerificationModalOpen(false);
      setRejectionReason('');
      fetchVerifications();
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject seller verification');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch = 
      verification.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verification.dti_certification_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'unknown';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller Verification Management</CardTitle>
          <CardDescription>Verify sellers by reviewing their DTI certification documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-auto flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business name or DTI number..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all">All Verifications</TabsTrigger>
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="recent">Recently Verified</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>DTI Number</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading seller verifications...
                        </TableCell>
                      </TableRow>
                    ) : filteredVerifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No verification requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVerifications.map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell className="font-medium">{verification.business_name}</TableCell>
                          <TableCell>{verification.document_type}</TableCell>
                          <TableCell>{verification.dti_certification_number}</TableCell>
                          <TableCell>{new Date(verification.dti_certification_expiry).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(verification.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewVerification(verification)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                      <TableHead>Business Name</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>DTI Number</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading pending verifications...
                        </TableCell>
                      </TableRow>
                    ) : verifications.filter(v => v.status === 'pending').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No pending verification requests
                        </TableCell>
                      </TableRow>
                    ) : (
                      verifications
                        .filter(v => v.status === 'pending')
                        .map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell className="font-medium">{verification.business_name}</TableCell>
                            <TableCell>{verification.document_type}</TableCell>
                            <TableCell>{verification.dti_certification_number}</TableCell>
                            <TableCell>{new Date(verification.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-500 border-green-500"
                                  onClick={() => handleViewVerification(verification)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
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
                      <TableHead>Business Name</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading recent verifications...
                        </TableCell>
                      </TableRow>
                    ) : (
                      verifications
                        .filter(v => v.status !== 'pending')
                        .slice(0, 5)
                        .map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell className="font-medium">{verification.business_name}</TableCell>
                            <TableCell>{verification.document_type}</TableCell>
                            <TableCell>{getStatusBadge(verification.status)}</TableCell>
                            <TableCell>{verification.verification_date ? new Date(verification.verification_date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewVerification(verification)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Verify Seller Account</DialogTitle>
            <DialogDescription>
              Review the DTI certification details before approving this seller.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              <Tabs defaultValue="dti_certification">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="business_info">Business Information</TabsTrigger>
                  <TabsTrigger value="dti_certification">DTI Certification</TabsTrigger>
                </TabsList>
                
                <TabsContent value="business_info" className="mt-4 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium text-muted-foreground">Business Name</div>
                    <div className="text-sm col-span-3 font-semibold">{selectedVerification.business_name}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium text-muted-foreground">Submitted On</div>
                    <div className="text-sm col-span-3">{new Date(selectedVerification.created_at).toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="text-sm col-span-3">{getStatusBadge(selectedVerification.status)}</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dti_certification" className="mt-4 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium text-muted-foreground">Document Type</div>
                    <div className="text-sm col-span-3">{selectedVerification.document_type}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium text-muted-foreground">DTI Number</div>
                    <div className="text-sm col-span-3 font-semibold">{selectedVerification.dti_certification_number}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium text-muted-foreground">Expiry Date</div>
                    <div className="text-sm col-span-3">{new Date(selectedVerification.dti_certification_expiry).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">DTI Certification Document</div>
                    <div className="bg-gray-50 p-4 border rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-blue-500 mr-2" />
                        <span className="text-sm">
                          {selectedVerification.document_url.split('/').pop() || 'Document'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {documentPreviewUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(documentPreviewUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        )}
                        {getDocumentType(selectedVerification.document_url) === 'image' && documentPreviewUrl && (
                          <div className="mt-4">
                            <img 
                              src={documentPreviewUrl} 
                              alt="Verification document" 
                              className="max-w-full rounded-md border"
                              style={{ maxHeight: '300px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {selectedVerification.status === 'pending' && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-sm font-medium">Rejection Reason (if rejected)</h4>
                  <Textarea
                    placeholder="Provide a reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            {selectedVerification?.status === 'pending' ? (
              <>
                <Button variant="outline" onClick={() => setIsVerificationModalOpen(false)}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={handleRejectVerification}
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleApproveVerification}
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve Seller
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => setIsVerificationModalOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerVerificationManagement;
