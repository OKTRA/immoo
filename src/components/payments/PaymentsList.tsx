import { useState } from "react";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentData } from "@/services/payment";
import { Plus } from "lucide-react";
import { 
  Table,
  TableBody,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { usePaymentsSorting } from "./hooks/usePaymentsSorting";
import PaymentsTableHeader from "./list/PaymentsTableHeader";
import PaymentRow from "./list/PaymentRow";
import EmptyPaymentsList from "./list/EmptyPaymentsList";

interface PaymentsListProps {
  payments: PaymentData[];
  onAddPayment: () => void;
  onEditPayment: (payment: PaymentData) => void;
  onDeletePayment: (paymentId: string) => void;
  selectedPaymentIds?: string[];
  onPaymentSelect?: (paymentId: string, selected: boolean) => void;
}

export default function PaymentsList({ 
  payments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  selectedPaymentIds = [],
  onPaymentSelect
}: PaymentsListProps) {
  // Séparer les paiements initiaux et les loyers pour faciliter la gestion
  const initialPayments = payments.filter(
    (p) => p.paymentType === "deposit" || p.paymentType === "agency_fee"
  );
  const rentPayments = payments.filter(
    (p) => p.paymentType !== "deposit" && p.paymentType !== "agency_fee"
  );

  // Deux hooks de tri distincts pour chaque groupe
  const {
    sortedPayments: sortedInitials,
    sortField: sortFieldInitial,
    sortDirection: sortDirectionInitial,
    handleSort: handleSortInitial,
  } = usePaymentsSorting(initialPayments);

  const {
    sortedPayments: sortedRents,
    sortField: sortFieldRent,
    sortDirection: sortDirectionRent,
    handleSort: handleSortRent,
  } = usePaymentsSorting(rentPayments);
  
  const [activeTab, setActiveTab] = useState<'rent' | 'initial'>('rent');

  // Liste affichée selon l'onglet courant
  const displayedPayments = activeTab === 'rent' ? sortedRents : sortedInitials;

  const sortFieldCurrent = activeTab === 'rent' ? sortFieldRent : sortFieldInitial;
  const sortDirectionCurrent = activeTab === 'rent' ? sortDirectionRent : sortDirectionInitial;
  const handleSortCurrent = activeTab === 'rent' ? handleSortRent : handleSortInitial;

  // Sélection globale
  const allSelected = displayedPayments.length > 0 && displayedPayments.every((p) => selectedPaymentIds.includes(p.id || ''));

  const handleToggleSelectAll = (checked: boolean) => {
    displayedPayments.forEach((p) => {
      if (p.id && onPaymentSelect) {
        onPaymentSelect(p.id, checked);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            {payments.length} paiement{payments.length !== 1 ? "s" : ""} au total
            {selectedPaymentIds.length > 0 && ` (${selectedPaymentIds.length} sélectionné${selectedPaymentIds.length > 1 ? 's' : ''})`}
          </CardDescription>
        </div>
        <Button onClick={onAddPayment}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un paiement
        </Button>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyPaymentsList />
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="rent">Loyers</TabsTrigger>
              <TabsTrigger value="initial">Paiements initiaux</TabsTrigger>
            </TabsList>

            {/* Tab Loyers */}
            <TabsContent value="rent">
              {sortedRents.length === 0 ? (
                <EmptyPaymentsList />
              ) : (
                <Table>
                  <PaymentsTableHeader
                    sortField={sortFieldRent}
                    sortDirection={sortDirectionRent}
                    onSort={handleSortRent}
                    showSelectionColumn={!!onPaymentSelect}
                    allSelected={allSelected}
                    onToggleSelectAll={handleToggleSelectAll}
                  />
                  <TableBody>
                    {sortedRents.map((payment) => (
                      <PaymentRow
                        key={payment.id}
                        payment={payment}
                        onEditPayment={onEditPayment}
                        onDeletePayment={onDeletePayment}
                        showSelectionColumn={!!onPaymentSelect}
                        isSelected={selectedPaymentIds.includes(payment.id || '')}
                        onPaymentSelect={onPaymentSelect}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab Paiements initiaux */}
            <TabsContent value="initial">
              {sortedInitials.length === 0 ? (
                <EmptyPaymentsList />
              ) : (
                <Table>
                  <PaymentsTableHeader
                    sortField={sortFieldInitial}
                    sortDirection={sortDirectionInitial}
                    onSort={handleSortInitial}
                    showSelectionColumn={!!onPaymentSelect}
                    allSelected={allSelected}
                    onToggleSelectAll={handleToggleSelectAll}
                  />
                  <TableBody>
                    {sortedInitials.map((payment) => (
                      <PaymentRow
                        key={payment.id}
                        payment={payment}
                        onEditPayment={onEditPayment}
                        onDeletePayment={onDeletePayment}
                        showSelectionColumn={!!onPaymentSelect}
                        isSelected={selectedPaymentIds.includes(payment.id || '')}
                        onPaymentSelect={onPaymentSelect}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
