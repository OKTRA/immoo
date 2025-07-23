import React from 'react';
import ContractWysiwygEditor from '@/components/contracts/ContractWysiwygEditor';
import { formatContractText } from '@/utils/contractFormatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestContractFormatting() {
  // Exemple de contrat brut comme celui généré par l'IA
  const rawContractText = `**CONTRAT DE BAIL** ** Entre ** **La propriétaire**, représentée par l'agence immobilière **[24d36749-1367-4d5d-b986-d113b4732f7d]**, ci-après dénommée "l'Agence", ayant son siège social à [adresse de l'agence]; * **Le locataire** Monsieur/Madame **Awa MAIGA**, ci-après dénommé "le Locataire", demeurant à [adresse du locataire], né(e) le [date de naissance], de nationalité malienne, portant le numéro de téléphone **79020596** et l'adresse email **awa@gmail.com**, ayant pour identifiant unique **decf225-accd-4a82-8ade-8d448b75cab4**. **Objet du contrat** Le présent contrat a pour objet la location par l'Agence au profit du Locataire du bien immobilier suivant : * Immeuble situé à [adresse du bien], dans la commune de [commune], au Mali; * Identifié par le numéro de propriété **a78dc4f4-5503-4c94-a0e0-b508ccea320d**; * Désigné ci-après comme "le Bien". **Durée du contrat** Le présent contrat est conclu pour une durée de [durée du contrat, par exemple 1 an], à compter du [date de début du contrat]. Au terme de cette période, le contrat pourra être renouvelé par accord écrit des parties. **Loyers et charges** Le Locataire s'engage à payer un loyer mensuel de [montant du loyer] FCFA, payable à l'Agence au plus tard le [date de paiement du loyer] de chaque mois. En outre, le Locataire sera tenu de payer les charges suivantes : * Les frais de gestion et de maintenance du Bien; * Les impôts et taxes afférents au Bien; * Les frais de fourniture d'eau, d'électricité et de gaz. ** Obligations du Locataire ** Le Locataire s'engage à : * occuper le Bien en bon père de famille et à le maintenir en bon état; * respecter les réglementations et les dispositions légales en vigueur; * informer l'Agence de tout problème ou dommage affectant le Bien; * céder le Bien en bon état à l'expiration du contrat, hormis la détérioration normale due à l'usure. ** Obligations de l'Agence ** L'Agence s'engage à : * délivrer le Bien au Locataire en bon état et en parfait fonctionnement; * entretenir le Bien et en assurer la maintenance; * informer le Locataire de tout problème ou dommage affectant le Bien. **Résiliation du contrat** Le présent contrat pourra être résilié par l'une ou l'autre des parties, moyennant un préavis de [durée du préavis, par exemple 3 mois] avant la date de résiliation. **Litiges** Tout litige résultant de l'interprétation ou de l'exécution du présent contrat sera soumis à la juridiction compétente du Mali. **Accord** Les parties ont lu et compris les termes du présent contrat et les ont signés en deux exemplaires, dont l'un sera remis au Locataire et l'autre restera à l'Agence. **Signatures** * Le Locataire : **Awa MAIGA** * L'Agence : **`;

  const formattedText = formatContractText(rawContractText);

  const handleSave = (content: string, metadata: any) => {
    console.log('Contenu sauvegardé:', content);
    console.log('Métadonnées:', metadata);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Test du Formatage de Contrats</h1>
        <p className="text-gray-600">
          Cette page teste le formatage automatique des contrats générés par l'IA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Texte brut */}
        <Card>
          <CardHeader>
            <CardTitle>Texte brut (généré par l'IA)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded text-sm max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap">{rawContractText}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Texte formaté */}
        <Card>
          <CardHeader>
            <CardTitle>Texte formaté (HTML)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded text-sm max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap">{formattedText}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Éditeur WYSIWYG */}
      <Card>
        <CardHeader>
          <CardTitle>Éditeur WYSIWYG avec formatage</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractWysiwygEditor
            initialContent={rawContractText}
            onSave={handleSave}
            isReadOnly={false}
            showToolbar={true}
          />
        </CardContent>
      </Card>
    </div>
  );
} 