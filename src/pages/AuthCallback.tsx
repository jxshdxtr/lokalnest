import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session to check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          toast.error('No session found. Authentication may have failed.');
          navigate('/auth');
          return;
        }

        // Get user metadata to determine account type
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        const accountType = userData.user?.user_metadata?.account_type;
        toast.success('Successfully logged in!');

        // Redirect based on account type
        if (accountType === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/buyer/home');
        }
      } catch (error: any) {
        console.error('Authentication callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 space-y-4 bg-card rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center">Completing Login</h1>
          <div className="flex flex-col items-center justify-center space-y-4">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p>Please wait while we complete your authentication...</p>
              </>
            ) : (
              <p>Redirecting you to the dashboard...</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthCallback;