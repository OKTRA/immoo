import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface PaymentsTableHeaderProps {
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  showSelectionColumn: boolean;
  allSelected?: boolean;
  onToggleSelectAll?: (checked: boolean) => void;
}

export default function PaymentsTableHeader({ 
  sortField, 
  sortDirection, 
  onSort,
  showSelectionColumn,
  allSelected = false,
  onToggleSelectAll
}: PaymentsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        {showSelectionColumn && (
          <TableHead style={{ width: 40 }}>
            <Checkbox 
              checked={allSelected}
              onCheckedChange={(checked) => onToggleSelectAll && onToggleSelectAll(!!checked)}
            />
          </TableHead>
        )}
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("dueDate")}
        >
          Échéance {sortField === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Type</TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("amount")}
        >
          Montant {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("effectiveStatus")}
        >
          Statut {sortField === "effectiveStatus" && (sortDirection === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Date de paiement</TableHead>
        <TableHead>Notes</TableHead>
        <TableHead style={{ width: 40 }}>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
