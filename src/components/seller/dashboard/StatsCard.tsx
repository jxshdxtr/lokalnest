
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatData } from './types';

const StatsCard: React.FC<StatData> = ({ title, value, description, icon, trend = 'neutral' }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-full p-2 bg-muted">
            {icon}
          </div>
          {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-xs mt-1 ${
            trend === 'up' ? 'text-green-500' : 
            trend === 'down' ? 'text-red-500' : 
            'text-muted-foreground'
          }`}>
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
