
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CustomerTable from './customers/CustomerTable';

const CustomerManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <CustomerTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
