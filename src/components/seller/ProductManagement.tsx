
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';
import ProductFilters from './ProductFilters';
import ProductToolbar from './ProductToolbar';
import { supabase } from '@/integrations/supabase/client';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSellerVerified, setIsSellerVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  useEffect(() => {
    const checkSellerVerification = async () => {
      try {
        setIsCheckingVerification(true);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        
        // Check if user is a seller
        const userType = session.user.user_metadata?.account_type;
        if (userType !== 'seller') {
          toast.error('This dashboard is only for seller accounts');
          navigate('/');
          return;
        }
        
        // Check seller verification status
        const { data: sellerProfile } = await supabase
          .from('seller_profiles')
          .select('is_verified')
          .eq('id', session.user.id)
          .maybeSingle();
          
        setIsSellerVerified(sellerProfile?.is_verified || false);
        
        // If not verified, check if verification has been submitted
        if (!sellerProfile?.is_verified) {
          const { data: verification, error } = await supabase
            .from('seller_verifications')
            .select('status')
            .eq('seller_id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error('Error checking verification:', error);
          }
          
          // If no verification exists, redirect to verification page
          if (!verification) {
            toast.info('You need to submit your DTI documents for verification first');
            navigate('/seller/verification');
            return;
          } else if (verification.status === 'pending') {
            toast.info('Your seller verification is still pending approval');
          } else if (verification.status === 'rejected') {
            toast.error('Your seller verification was rejected. Please contact support.');
          }
        }
      } catch (error) {
        console.error('Error checking seller verification:', error);
      } finally {
        setIsCheckingVerification(false);
      }
    };
    
    checkSellerVerification();
  }, [navigate]);

  const handleViewProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setIsDetailOpen(true);
  };

  const handleCreateNew = () => {
    if (!isSellerVerified) {
      toast.error('Your account must be verified before you can add products');
      return;
    }
    setIsCreateOpen(true);
  };

  if (isCheckingVerification) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">Checking verification status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isSellerVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <h3 className="font-medium text-amber-800">Account Verification Required</h3>
          <p className="text-amber-700 text-sm mt-1">
            Your seller account is pending verification. You can view products but cannot add new ones until your account is verified.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-xl font-semibold">Product Management</h1>
        <Button 
          onClick={handleCreateNew} 
          className="flex items-center gap-1"
          disabled={!isSellerVerified}
        >
          <PlusCircle size={16} />
          <span>Add Product</span>
        </Button>
      </div>

      <ProductToolbar />
      <ProductFilters />
      <ProductTable onViewDetail={handleViewProductDetail} />

      {isCreateOpen && (
        <ProductFormModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      )}

      {isDetailOpen && selectedProductId && (
        <ProductDetailModal
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          productId={selectedProductId}
        />
      )}
    </div>
  );
};

export default ProductManagement;
