import React from 'react';
import ContractWysiwygEditor from '@/components/contracts/ContractWysiwygEditor';
import { toast } from 'sonner';

export default function TestContractEditor() {
  const handleSave = async (content: string, metadata: any) => {
    console.log('Saving contract:', { content, metadata });
    toast.success('Contrat sauvegardé avec succès');
  };

  const handleAssignToLease = async (contractId: string, leaseId: string) => {
    console.log('Assigning contract to lease:', { contractId, leaseId });
    toast.success('Contrat attribué au bail avec succès');
  };

  const availableLeases = [
    {
      id: '1',
      title: 'Bail Appartement 2A',
      tenantName: 'Jean Dupont',
      propertyName: 'Résidence Les Jardins'
    },
    {
      id: '2',
      title: 'Bail Villa 15',
      tenantName: 'Marie Martin',
      propertyName: 'Quartier Plateau'
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test de l'Éditeur de Contrats</h1>
        <p className="text-gray-600">
          Page de test pour l'éditeur WYSIWYG de contrats
        </p>
      </div>

      <ContractWysiwygEditor
        initialContent="<h1>Contrat de Location</h1><p>Ceci est un exemple de contrat de location...</p>"
        contractId="test-123"
        onSave={handleSave}
        onAssignToLease={handleAssignToLease}
        availableLeases={availableLeases}
        isReadOnly={false}
        showToolbar={true}
      />
    </div>
  );
} 