import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, CalendarDays, Building2, Users, Package } from 'lucide-react';
import { getBillingCycleLabel, getBillingCycleSuffix, getDaysUntilExpiration } from '@/services/subscription';

interface PlanSummaryProps {
  subscription: any | null;
  className?: string;
}

function getPlan(subscription: any | null) {
  if (!subscription) return null;
  // Support multiple shapes
  return subscription.plan || subscription.subscription_plans || subscription.plan_info || null;
}

function getPlanName(plan: any | null): string {
  if (!plan) return 'Gratuit';
  return plan.name || plan.plan_name || 'Gratuit';
}

function getBillingCycle(plan: any | null): string {
  if (!plan) return 'monthly';
  return plan.billing_cycle || plan.billingCycle || 'monthly';
}

function getLimit(plan: any | null, key: string, fallback = 0): number {
  if (!plan) return fallback;
  const map: Record<string, any> = {
    maxProperties: plan.max_properties ?? plan.maxProperties,
    maxAgencies: plan.max_agencies ?? plan.maxAgencies,
    maxLeases: plan.max_leases ?? plan.maxLeases,
    maxUsers: plan.max_users ?? plan.maxUsers
  };
  return map[key] ?? fallback;
}

export default function PlanSummary({ subscription, className }: PlanSummaryProps) {
  const plan = getPlan(subscription);
  const planName = getPlanName(plan);
  const billingCycle = getBillingCycle(plan);
  const endDate = subscription?.end_date || subscription?.endDate || null;
  const daysLeft = getDaysUntilExpiration(endDate);

  const limits = {
    properties: getLimit(plan, 'maxProperties', 1),
    agencies: getLimit(plan, 'maxAgencies', 1),
    leases: getLimit(plan, 'maxLeases', 2),
    users: getLimit(plan, 'maxUsers', 1)
  };

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-immoo-gold to-immoo-navy flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge className="px-2 py-0.5">{planName}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {getBillingCycleLabel(billingCycle)}{getBillingCycleSuffix(billingCycle)}
                  {Number.isFinite(daysLeft) && daysLeft >= 0 && (
                    <>
                      {' · '}
                      {daysLeft === Infinity ? '' : `${daysLeft} j restants`}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{limits.properties === -1 ? 'Illimité' : limits.properties} propriétés</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{limits.users === -1 ? 'Illimité' : limits.users} utilisateurs</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{limits.leases === -1 ? 'Illimité' : limits.leases} baux</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


