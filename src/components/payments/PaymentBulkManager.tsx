import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircleIcon, RefreshCw, Loader2, Calendar, RefreshCcw } from "lucide-react";
import { PaymentData, generateHistoricalPayments, updateBulkPayments } from "@/services/payment";

interface PaymentBulkManagerProps {
  leaseId: string;
  initialRentAmount: number;
  onPaymentsGenerated: (payments: PaymentData[]) => void;
  onPaymentsUpdated: () => void;
  selectedPaymentIds: string[];
}

export default function PaymentBulkManager({
  leaseId,
  initialRentAmount,
  onPaymentsGenerated,
  onPaymentsUpdated,
  selectedPaymentIds
}: PaymentBulkManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [rentAmount, setRentAmount] = useState(initialRentAmount.toString());
  
  const [newStatus, setNewStatus] = useState("undefined");
  const [updateNotes, setUpdateNotes] = useState("");
  
  const handleGeneratePayments = async () => {
    if (!firstPaymentDate) {
      toast({
        title: "Date requise",
        description: "Veuillez sélectionner la date du premier paiement",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setGenerating(true);
      
      const result = await generateHistoricalPayments(
        leaseId,
        parseFloat(rentAmount),
        firstPaymentDate,
        frequency
      );
      
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      if (result.data && result.data.length > 0) {
        toast({
          title: "Paiements générés",
          description: `${result.data.length} paiements ont été générés avec succès`,
          variant: "default"
        });
        
        onPaymentsGenerated(result.data);
      } else {
        toast({
          title: "Aucun paiement généré",
          description: "Aucun paiement n'a été généré. Vérifiez les dates et réessayez.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error generating payments:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des paiements",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };
  
  const handleBulkUpdate = async () => {
    if (selectedPaymentIds.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un paiement à mettre à jour",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      const result = await updateBulkPayments({
        paymentIds: selectedPaymentIds,
        status: newStatus as any,
        notes: updateNotes || undefined
      });
      
      if (!result.success) {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la mise à jour des paiements",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Mise à jour réussie",
        description: `${selectedPaymentIds.length} paiements ont été mis à jour avec le statut "${newStatus}"`,
        variant: "default"
      });
      
      setUpdateNotes("");
      
      onPaymentsUpdated();
    } catch (error) {
      console.error("Error updating payments:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des paiements",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Action rapide : marquer comme payé
  const handleQuickMarkPaid = async () => {
    if (selectedPaymentIds.length === 0) return;

    try {
      const result = await updateBulkPayments({
        paymentIds: selectedPaymentIds,
        status: 'paid',
        notes: undefined
      } as any);

      if (!result.success) {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de mettre à jour',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Statut mis à jour',
        description: `${selectedPaymentIds.length} paiement(s) marqué(s) comme payé`,
        variant: 'default'
      });
      onPaymentsUpdated();
    } catch (e) {
      console.error(e);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gestion des paiements</CardTitle>
          {selectedPaymentIds.length > 0 && (
            <Button size="sm" onClick={handleQuickMarkPaid} variant="secondary">
              Marquer comme payé ({selectedPaymentIds.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Génération historique</TabsTrigger>
          <TabsTrigger value="update" disabled={selectedPaymentIds.length === 0}>
            Mise à jour en masse {selectedPaymentIds.length > 0 && `(${selectedPaymentIds.length})`}
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6">
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstPaymentDate">Date du premier paiement</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstPaymentDate"
                  type="date"
                  value={firstPaymentDate}
                  onChange={(e) => setFirstPaymentDate(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Cette date sera utilisée comme point de départ pour générer tous les paiements historiques.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Fréquence de paiement</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Sélectionner une fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="biannually">Semestriel</SelectItem>
                  <SelectItem value="annually">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Montant du loyer</Label>
              <Input
                id="rentAmount"
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleGeneratePayments} 
              disabled={generating || !firstPaymentDate}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Générer les paiements historiques
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p>
                Cette action va générer tous les paiements depuis la date du premier paiement jusqu'à aujourd'hui
                en fonction de la fréquence sélectionnée. Les paiements générés auront le statut "indéfini".
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="update" className="space-y-4">
            <div className="space-y-2">
              <Label>Paiements sélectionnés</Label>
              <div className="p-2 bg-muted rounded-md">
                <p className="text-sm">
                  {selectedPaymentIds.length} paiement(s) sélectionné(s)
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newStatus">Nouveau statut</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="late">En retard</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="undefined">Indéfini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="updateNotes">Notes (optionnel)</Label>
              <Textarea
                id="updateNotes"
                placeholder="Ajoutez des notes sur cette mise à jour..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleBulkUpdate} 
              disabled={updating || selectedPaymentIds.length === 0}
              className="w-full"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Mettre à jour {selectedPaymentIds.length} paiement(s)
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p>
                Cette action va mettre à jour le statut de tous les paiements sélectionnés.
                L'historique des mises à jour sera conservé.
              </p>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            onPaymentsUpdated();
          }}
          className="w-full"
          disabled={generating || updating}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualiser les données
        </Button>
      </CardFooter>
    </Card>
  );
}
