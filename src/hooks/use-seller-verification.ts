import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VerificationStatus = 'pending' | 'rejected' | 'not_submitted';

interface UseSellerVerificationReturn {
  isVerified: boolean;
  isLoading: boolean;
  sellerId: string | null;
  verificationStatus: VerificationStatus | null;
  showVerificationBanner: boolean;
}

export function useSellerVerification(): UseSellerVerificationReturn {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }
        
        // Set seller ID
        setSellerId(session.user.id);
        
        // Check if seller is verified
        const { data: sellerData, error: sellerError } = await supabase
          .from('seller_profiles')
          .select('is_verified')
          .eq('id', session.user.id)
          .single();
        
        if (sellerError && sellerError.code !== 'PGRST116') {
          throw sellerError;
        }
        
        const verified = !!sellerData?.is_verified;
        setIsVerified(verified);
        
        if (!verified) {
          setShowVerificationBanner(true);
          
          // Check for pending verification requests
          const { data: verificationData, error: verificationError } = await supabase
            .from('seller_verifications')
            .select('status, created_at')
            .eq('seller_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (verificationError) throw verificationError;
          
          if (verificationData && verificationData.length > 0) {
            setVerificationStatus(verificationData[0].status as VerificationStatus);
          } else {
            setVerificationStatus('not_submitted');
          }
        } else {
          setShowVerificationBanner(false);
          setVerificationStatus(null);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        toast.error('Failed to check seller verification status');
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, []);

  return {
    isVerified,
    isLoading,
    sellerId,
    verificationStatus,
    showVerificationBanner
  };
} 