import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => {
  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm text-muted-foreground mb-2">{title}</p>
          <h3 className="text-2xl md:text-4xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={`text-xs md:text-sm mt-2 ${trend.positive ? 'text-success' : 'text-destructive'}`}>
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
};
