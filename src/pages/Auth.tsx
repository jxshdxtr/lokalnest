
import React from 'react';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  return (
    <Layout>
      <div className="min-h-screen pt-16 pb-16 flex items-center justify-center bg-gradient-soft">
        <div className="w-full max-w-lg mx-auto px-4 animate-scale-in">
          <AuthForm />
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
