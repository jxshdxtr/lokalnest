
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import SellerVerificationForm from '@/components/auth/SellerVerificationForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SellerVerification = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No user logged in, redirect to auth page
          toast.error('You need to be logged in to verify your seller account');
          navigate('/auth');
          return;
        }

        setUserId(session.user.id);

        // Check if the user is a seller
        const userType = session.user.user_metadata?.account_type;
        if (userType !== 'seller') {
          toast.error('This page is only for seller accounts.');
          navigate('/');
          return;
        }

        // Check if seller verification already exists
        const { data: verificationData, error: verificationError } = await supabase
          .from('seller_verifications')
          .select('*')
          .eq('seller_id', session.user.id)
          .maybeSingle();

        if (verificationError) {
          console.error('Error fetching verification data:', verificationError);
        }

        if (verificationData) {
          // Seller has already submitted verification
          toast.info(`Your verification is ${verificationData.status}. Redirecting to dashboard.`);
          navigate('/seller/dashboard');
          return;
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('Failed to check your session. Please try logging in again.');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleVerificationComplete = () => {
    toast.success('Verification submitted successfully! You will be notified once your account is verified.');
    navigate('/seller/dashboard');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen pt-16 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading verification page...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <Layout>
      <div className="min-h-screen pt-16 pb-16 flex items-center justify-center bg-gradient-soft">
        <div className="w-full max-w-3xl mx-auto px-4 animate-scale-in">
          <div className="w-full p-6 space-y-6 bg-white rounded-lg shadow-elevation-1 border border-border">
            <SellerVerificationForm 
              userId={userId} 
              onComplete={handleVerificationComplete} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerVerification;
