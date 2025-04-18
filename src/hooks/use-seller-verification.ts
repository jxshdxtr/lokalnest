import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VerificationStatus = 'pending' | 'rejected' | 'not_submitted' | 'approved' | 'verified';

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
        
        // Check verification status directly from seller_verifications table
        const { data: verificationData, error: verificationError } = await supabase
          .from('seller_verifications')
          .select('status')
          .eq('seller_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (verificationError) throw verificationError;
        
        if (verificationData && verificationData.length > 0) {
          // Set verification status
          setVerificationStatus(verificationData[0].status as VerificationStatus);
          // Set verified if status is either 'approved' or 'verified'
          const verified = verificationData[0].status === 'approved' || verificationData[0].status === 'verified';
          setIsVerified(verified);
          setShowVerificationBanner(!verified);
        } else {
          setVerificationStatus('not_submitted');
          setIsVerified(false);
          setShowVerificationBanner(true);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        toast.error('Failed to check seller verification status');
        setIsVerified(false);
        setVerificationStatus(null);
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