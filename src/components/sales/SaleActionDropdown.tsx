import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, Eye, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import { Property } from '@/assets/types';
import { updateProperty } from '@/services/property/propertyMutations';
import { createPropertySale } from '@/services/sales/propertySalesService';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface SaleActionDropdownProps {
  property: Property;
  agencyId: string;
  onPropertyUpdate?: (updatedProperty: Property) => void;
}

export default function SaleActionDropdown({ 
  property, 
  agencyId, 
  onPropertyUpdate 
}: SaleActionDropdownProps) {
  const [loading, setLoading] = useState(false);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [saleData, setSaleData] = useState({
    salePrice: property.price?.toString() || '',
    buyerName: '',
    notes: '',
    saleDate: new Date().toISOString().split('T')[0],
    commissionRate: property.commissionRate?.toString() || '5'
  });

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const { property: updatedProperty, error } = await updateProperty(property.id, {
        status: newStatus
      });
      
      if (error) {
        toast.error(`Erreur lors du changement de statut: ${error}`);
        return;
      }
      
      toast.success(`Statut changé vers: ${getStatusLabel(newStatus)}`);
      onPropertyUpdate?.(updatedProperty);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSale = async () => {
    if (!saleData.salePrice || !saleData.buyerName || !saleData.commissionRate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const commissionRateValue = parseFloat(saleData.commissionRate);
    if (commissionRateValue < 0 || commissionRateValue > 100) {
      toast.error('Le taux de commission doit être entre 0% et 100%');
      return;
    }

    setLoading(true);
    try {
      // Update property commission rate if changed
      if (parseFloat(saleData.commissionRate) !== property.commissionRate) {
        await updateProperty(property.id, {
          commissionRate: commissionRateValue
        });
      }

      // Create sale record
      const { sale, error: saleError } = await createPropertySale({
        property_id: property.id,
        sale_price: parseFloat(saleData.salePrice),
        sale_date: saleData.saleDate,
        buyer_name: saleData.buyerName,
        notes: saleData.notes,
        status: 'completed',
        commission_rate: commissionRateValue
      });

      if (saleError) {
        toast.error(`Erreur lors de l'enregistrement de la vente: ${saleError}`);
        return;
      }

      // Update property status to sold
      const { property: updatedProperty, error: updateError } = await updateProperty(property.id, {
        status: 'sold'
      });

      if (updateError) {
        toast.error(`Erreur lors de la mise à jour du statut: ${updateError}`);
        return;
      }

      toast.success(`Vente confirmée pour ${formatCurrency(parseFloat(saleData.salePrice))}`);
      setShowSaleDialog(false);
      onPropertyUpdate?.(updatedProperty);
      
      // Force reload if on sales page
      if (window.location.pathname.includes('/sales')) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error confirming sale:', error);
      toast.error('Erreur lors de la confirmation de la vente');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'pending': return 'En négociation';
      case 'sold': return 'Vendu';
      case 'withdrawn': return 'Retiré de la vente';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'sold': return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'withdrawn': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const isSold = property.status === 'sold';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <Eye className="h-3 w-3 mr-1" />
            {isSold ? 'Détails vente' : 'Gérer la vente'}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => window.location.href = `/agencies/${agencyId}/properties/${property.id}/sales`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir détails vente
          </DropdownMenuItem>
          
          {!isSold && (
            <>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => setShowSaleDialog(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Confirmer la vente
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {property.status !== 'available' && (
                <DropdownMenuItem onClick={() => handleStatusChange('available')}>
                  {getStatusIcon('available')}
                  <span className="ml-2">Marquer disponible</span>
                </DropdownMenuItem>
              )}
              
              {property.status !== 'pending' && (
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  {getStatusIcon('pending')}
                  <span className="ml-2">Marquer en négociation</span>
                </DropdownMenuItem>
              )}
              
              {property.status !== 'withdrawn' && (
                <DropdownMenuItem onClick={() => handleStatusChange('withdrawn')}>
                  {getStatusIcon('withdrawn')}
                  <span className="ml-2">Retirer de la vente</span>
                </DropdownMenuItem>
              )}
            </>
          )}

          {isSold && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-xs text-muted-foreground">
                🎉 Propriété vendue
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sale Confirmation Dialog */}
      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la vente</DialogTitle>
            <DialogDescription>
              Enregistrez les détails de la vente pour {property.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="salePrice">Prix de vente (FCFA) *</Label>
              <Input
                id="salePrice"
                type="number"
                value={saleData.salePrice}
                onChange={(e) => setSaleData(prev => ({ ...prev, salePrice: e.target.value }))}
                placeholder="Prix de vente"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="buyerName">Nom de l'acheteur *</Label>
              <Input
                id="buyerName"
                value={saleData.buyerName}
                onChange={(e) => setSaleData(prev => ({ ...prev, buyerName: e.target.value }))}
                placeholder="Nom complet de l'acheteur"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="saleDate">Date de vente</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleData.saleDate}
                onChange={(e) => setSaleData(prev => ({ ...prev, saleDate: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="commissionRate">Taux de commission (%) *</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={saleData.commissionRate}
                onChange={(e) => setSaleData(prev => ({ ...prev, commissionRate: e.target.value }))}
                placeholder="Taux de commission négocié"
              />
              <p className="text-xs text-muted-foreground">
                Vous pouvez ajuster le taux de commission négocié lors de la conclusion
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={saleData.notes}
                onChange={(e) => setSaleData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Conditions particulières, modalités de paiement..."
                rows={3}
              />
            </div>
            
            {saleData.salePrice && saleData.commissionRate && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm">
                    <strong>Commission négociée:</strong> {' '}
                    {formatCurrency(parseFloat(saleData.salePrice) * (parseFloat(saleData.commissionRate) / 100))}
                    {' '}({saleData.commissionRate}%)
                  </p>
                  {parseFloat(saleData.commissionRate) !== (property.commissionRate || 5) && (
                    <p className="text-xs text-orange-600">
                      ⚠️ Taux modifié (original: {property.commissionRate || 5}%)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSaleDialog(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmSale}
              disabled={loading || !saleData.salePrice || !saleData.buyerName || !saleData.commissionRate}
            >
              {loading ? 'Enregistrement...' : 'Confirmer la vente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
