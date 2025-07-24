import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Building, Calendar, Download, Edit3, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContractViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: {
    id: string;
    title: string;
    type: string;
    status: string;
    content: string;
    created_at: string;
    updated_at: string;
    lease?: {
      id: string;
      start_date: string;
      end_date: string;
      monthly_rent: number;
      tenants?: {
        first_name: string;
        last_name: string;
      };
      properties?: {
        title: string;
        location: string;
      };
    };
  } | null;
  onEdit?: () => void;
}

export default function ContractViewDialog({ 
  isOpen, 
  onClose, 
  contract, 
  onEdit 
}: ContractViewDialogProps) {
  if (!contract) return null;

  // Convert markdown-like syntax (**bold**) and line breaks to HTML
  const formattedHtml = React.useMemo(() => {
    if (!contract.content) return '';
    let html = contract.content;
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br/>');
    return html;
  }, [contract.content]);

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>${contract.title}</title><style>
      @page { margin: 20mm }
      body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
      strong { font-weight: 600; }
    </style></head><body>${formattedHtml}</body></html>`);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 100);
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Brouillon', className: '' },
      validated: { variant: 'default' as const, label: 'Validé', className: 'bg-blue-600 text-white' },
      closed: { variant: 'default' as const, label: 'Fermé', className: 'bg-green-600 text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      bail: 'Bail de location',
      vente: 'Contrat de vente',
      mandat: 'Mandat de gestion',
      prestation: 'Contrat de prestation',
      autre: 'Autre'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">{contract.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(contract.status)}
                  <Badge variant="outline">{getTypeLabel(contract.type)}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && contract.status !== 'closed' && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Informations du bail rattaché */}
              {contract.lease && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Bail rattaché
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Locataire</p>
                        <p className="font-medium">
                          {contract.lease.tenants?.first_name} {contract.lease.tenants?.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Propriété</p>
                        <p className="font-medium">{contract.lease.properties?.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Période</p>
                        <p className="font-medium">
                          Du {new Date(contract.lease.start_date).toLocaleDateString()} 
                          au {new Date(contract.lease.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Loyer mensuel</p>
                        <p className="font-medium">
                          {contract.lease.monthly_rent?.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}



              {/* Contenu du contrat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenu du contrat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formattedHtml }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 