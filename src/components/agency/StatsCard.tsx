import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-immoo-navy",
  className = ""
}) => {
  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-immoo-gray/30 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-immoo-navy/70 text-sm font-medium mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-immoo-navy">
              {value}
            </p>
            {trend && (
              <div className="flex items-center mt-2">
                <span 
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}
                </span>
                <span className="text-xs text-immoo-navy/60 ml-1">
                  vs mois dernier
                </span>
              </div>
            )}
          </div>
          <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-3 rounded-xl">
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 