import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Edit, Trash2, CheckCircle, XCircle, Star
} from 'lucide-react';
import { SubscriptionPlan } from '@/assets/types';
import { getBillingCycleSuffix, getBillingCycleLabel } from '@/utils/billingCycleUtils';

interface SubscriptionPlansTableProps {
  plans: SubscriptionPlan[];
  onEditPlan: (plan: SubscriptionPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export default function SubscriptionPlansTable({ 
  plans, 
  onEditPlan, 
  onDeletePlan 
}: SubscriptionPlansTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead>Prix (FCFA)</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead>Propriétés</TableHead>
          <TableHead>Agences</TableHead>
          <TableHead>Baux</TableHead>
          <TableHead>Utilisateurs</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                <span>{plan.name}</span>
                {plan.popular && (
                  <Badge variant="secondary">
                    <Star className="w-3 h-3 mr-1" />
                    Populaire
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {plan.price.toLocaleString()} FCFA
              <span className="text-sm text-muted-foreground">
                {getBillingCycleSuffix(plan.billingCycle || 'monthly')}
              </span>
            </TableCell>
            <TableCell>
              {getBillingCycleLabel(plan.billingCycle || 'monthly')}
            </TableCell>
            <TableCell>{plan.maxProperties === -1 ? 'Illimité' : plan.maxProperties}</TableCell>
            <TableCell>{plan.maxAgencies === -1 ? 'Illimité' : plan.maxAgencies}</TableCell>
            <TableCell>{plan.maxLeases === -1 ? 'Illimité' : plan.maxLeases}</TableCell>
            <TableCell>{plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers}</TableCell>
            <TableCell>
              {plan.isActive ? (
                <Badge variant="default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  Inactif
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditPlan(plan)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le plan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer le plan "{plan.name}" ? 
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeletePlan(plan.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
