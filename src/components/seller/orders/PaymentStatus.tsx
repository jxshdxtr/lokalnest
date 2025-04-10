
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PaymentStatusProps {
  status: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status }) => {
  const getPaymentStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Refunded</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return getPaymentStatusBadge(status);
};

export default PaymentStatus;
