import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { VerificationStatus } from '@/hooks/use-seller-verification';

interface VerificationBannerProps {
  status: VerificationStatus;
  message?: string;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ 
  status, 
  message 
}) => {
  const navigate = useNavigate();

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'pending':
        return 'Your DTI Certificate is under review. You will be notified once verified.';
      case 'rejected':
        return 'Your verification was rejected. Please submit new documents.';
      case 'not_submitted':
      default:
        return 'To access this feature, you need to verify your seller account with a DTI Certificate.';
    }
  };

  return (
    <Card className="mb-6 border-2 border-amber-500">
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="mr-4">
            {status === 'pending' ? (
              <Clock className="h-10 w-10 text-amber-500" />
            ) : status === 'rejected' ? (
              <ShieldAlert className="h-10 w-10 text-red-500" />
            ) : (
              <ShieldAlert className="h-10 w-10 text-blue-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">
              {status === 'pending' 
                ? 'Verification pending' 
                : status === 'rejected'
                  ? 'Verification rejected'
                  : 'Verification needed'}
            </h3>
            <p className="text-muted-foreground mb-2">
              {getStatusMessage()}
            </p>
            <p className="text-sm text-amber-700 mb-4">
              Until your account is verified, you won't be able to see or manage this data.
            </p>
            <Button
              onClick={() => navigate('/seller-verification')}
              variant={status === 'pending' ? 'outline' : 'default'}
              className={status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {status === 'pending' ? 'Check status' : 'Verify your account'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationBanner; 