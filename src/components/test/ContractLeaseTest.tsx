import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContractByLeaseId } from '@/services/contracts/leaseContractService';
import { toast } from 'sonner';

export default function ContractLeaseTest() {
  const [testLeaseId, setTestLeaseId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testContractRetrieval = async () => {
    if (!testLeaseId.trim()) {
      toast.error('Veuillez entrer un ID de bail');
      return;
    }

    setLoading(true);
    try {
      const result = await getContractByLeaseId(testLeaseId);
      setTestResult(result);
      
      if (result) {
        toast.success('Contrat trouvé !');
      } else {
        toast.info('Aucun contrat pour ce bail');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Erreur lors du test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Test de liaison Contrat-Bail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="ID du bail à tester"
            value={testLeaseId}
            onChange={(e) => setTestLeaseId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <Button 
            onClick={testContractRetrieval}
            disabled={loading}
          >
            {loading ? 'Test...' : 'Tester'}
          </Button>
        </div>

        {testResult && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold mb-2">Résultat :</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Instructions :</strong></p>
          <p>1. Trouvez l'ID d'un bail existant dans votre base de données</p>
          <p>2. Entrez-le dans le champ ci-dessus</p>
          <p>3. Cliquez "Tester" pour voir si un contrat est rattaché</p>
        </div>
      </CardContent>
    </Card>
  );
} 