import { useQuery } from "@tanstack/react-query";
import { getMonthlyEarnings } from "@/services/agency/agencyEarningsService";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface EarningsAnalyticsProps {
  agencyId: string;
  year: number;
  granularity: 'month' | 'year';
}

export default function EarningsAnalytics({ agencyId, year, granularity }: EarningsAnalyticsProps) {
  const { data: monthlyData, isLoading, error } = useQuery({
    queryKey: ["earnings-analytics", agencyId, year],
    queryFn: () => getMonthlyEarnings(agencyId, year),
    enabled: !!agencyId,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">Chargement des analytics...</div>
    );
  }

  if (error || !monthlyData) {
    return (
      <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
        <AlertCircle className="h-8 w-8" />
        Impossible de charger les analytics.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={granularity==='month'?monthlyData: aggregateYearly(monthlyData)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={granularity === 'month' ? 'month' : 'year'} stroke="#64748b" tickLine={false} />
            <YAxis tickFormatter={(v) => formatCurrency(v, "")} stroke="#64748b" tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              formatter={(value: number) => formatCurrency(value, "FCFA")}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="commissions" stackId="earnings" fill="#3b82f6" name="Commissions (récurrentes)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="agencyFees" stackId="earnings" fill="#a855f7" name="Frais d'agence (uniques)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total" dot={false} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function aggregateYearly(monthly: any[]) {
  const yearTotal = monthly.reduce((acc, m) => {
    const key = 'Année';
    if (!acc[key]) acc[key] = { year: key, commissions: 0, agencyFees: 0, total: 0 };
    acc[key].commissions += m.commissions;
    acc[key].agencyFees += m.agencyFees;
    acc[key].total += m.total;
    return acc;
  }, {} as any);
  return Object.values(yearTotal);
} 