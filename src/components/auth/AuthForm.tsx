
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Link } from 'react-router-dom';

const AuthForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow-elevation-1 border border-border">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to LocalNest</h1>
        <p className="text-muted-foreground mt-2">Sign in or create an account to continue</p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Create Account</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6">
          <LoginForm 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <RegisterForm 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        </TabsContent>
      </Tabs>

      <div className="text-xs text-center text-muted-foreground">
        By continuing, you agree to LocalNook's{' '}
        <Link to="/terms" className="text-blue-light hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-blue-light hover:underline">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
};

export default AuthForm;
