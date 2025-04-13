import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  MoreHorizontal, 
  Search,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SellerVerification {
  id: string;
  seller_id: string;
  document_type: string;
  certification_number: string;
  expiry_date: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes: string | null;
  // Joined fields
  seller_name?: string;
  seller_email?: string;
}

const SellerVerificationManagement = () => {
  const [verifications, setVerifications] = useState<SellerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [currentVerification, setCurrentVerification] = useState<SellerVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seller_verifications')
        .select(`
          *,
          profiles:seller_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((item: any) => ({
        ...item,
        seller_name: item.profiles?.full_name || 'Unknown',
        seller_email: item.profiles?.email || 'No email'
      }));

      setVerifications(formattedData);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (verificationId: string, sellerId: string) => {
    try {
      // Update the verification status
      const { error: verificationError } = await supabase
        .from('seller_verifications')
        .update({ status: 'approved' })
        .eq('id', verificationId);

      if (verificationError) throw verificationError;

      // Update the seller profile
      const { error: sellerError } = await supabase
        .from('seller_profiles')
        .update({ is_verified: true })
        .eq('id', sellerId);

      if (sellerError) throw sellerError;

      toast.success('Seller verification approved');
      fetchVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve verification');
    }
  };

  const rejectVerification = async () => {
    if (!currentVerification) return;

    try {
      // Update the verification status with rejection reason
      const { error } = await supabase
        .from('seller_verifications')
        .update({ 
          status: 'rejected',
          notes: rejectionReason
        })
        .eq('id', currentVerification.id);

      if (error) throw error;

      toast.success('Seller verification rejected');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      fetchVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredVerifications = verifications.filter(verification => 
    verification.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.seller_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.certification_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const viewVerification = (verification: SellerVerification) => {
    setCurrentVerification(verification);
    setIsViewDialogOpen(true);
  };

  const openRejectDialog = (verification: SellerVerification) => {
    setCurrentVerification(verification);
    setIsRejectDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller Verification Requests</CardTitle>
          <CardDescription>
            Review and approve or reject seller verification documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or certification number..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fetchVerifications()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading verification requests...</p>
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p>No verification requests found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Certification #</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVerifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{verification.seller_name}</p>
                          <p className="text-sm text-muted-foreground">{verification.seller_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {verification.document_type || 'DTI Certificate'}
                      </TableCell>
                      <TableCell>
                        {verification.certification_number}
                      </TableCell>
                      <TableCell>
                        {format(new Date(verification.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(verification.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => viewVerification(verification)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={verification.status !== 'pending'}
                              onClick={() => approveVerification(verification.id, verification.seller_id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={verification.status !== 'pending'}
                              onClick={() => openRejectDialog(verification)}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Reject
                            </DropdownMenuItem>
                            {verification.document_url && (
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <a 
                                  href={verification.document_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center w-full"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Open Document
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Verification Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Review the seller's verification information
            </DialogDescription>
          </DialogHeader>
          {currentVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Seller Name</Label>
                  <p className="font-medium">{currentVerification.seller_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{currentVerification.seller_email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Document Type</Label>
                  <p className="font-medium">{currentVerification.document_type || 'DTI Certificate'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Certification Number</Label>
                  <p className="font-medium">{currentVerification.certification_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Expiry Date</Label>
                  <p className="font-medium">
                    {format(new Date(currentVerification.expiry_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{getStatusBadge(currentVerification.status)}</p>
                </div>
              </div>
              {currentVerification.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{currentVerification.notes}</p>
                </div>
              )}
              {currentVerification.document_url && (
                <div>
                  <Label className="text-muted-foreground">Document</Label>
                  <div className="mt-2">
                    <a
                      href={currentVerification.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {currentVerification?.status === 'pending' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openRejectDialog(currentVerification);
                  }}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    approveVerification(currentVerification.id, currentVerification.seller_id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Verification Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this verification is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={rejectVerification}
              disabled={!rejectionReason.trim()}
            >
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerVerificationManagement; 