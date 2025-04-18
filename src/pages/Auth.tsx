import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';

const Auth = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/buyer/home';
  
  // Check if user is already signed in
  const [isSignedIn, setIsSignedIn] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsSignedIn(!!data.session);
    };

    checkAuth();
  }, []);

  // If checking auth state
  if (isSignedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  // If signed in, redirect to requested page or dashboard
  if (isSignedIn) {
    return <Navigate to={from} replace />;
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-background text-foreground">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <AuthForm />
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
