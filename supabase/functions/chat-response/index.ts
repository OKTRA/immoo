// SÉCURITÉ: Ce fichier utilise uniquement des variables d'environnement pour les clés API
// Aucune clé API n'est hardcodée dans ce fichier
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Récupération sécurisée de la clé API depuis les variables d'environnement
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Check if API key is available
  if (!GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ 
        error: 'GROQ_API_KEY environment variable is not configured',
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }

  try {
    const { userMessage, conversationHistory = [], context = {}, generateDocument = false } = await req.json()

    console.log('Chat request:', { userMessage, context, generateDocument })

    // Si on doit générer un document, utiliser un prompt différent
    if (generateDocument) {
      return await generateDocumentResponse(conversationHistory, context, corsHeaders);
    }

    // Construire le prompt système pour le chat
    const systemPrompt = buildSystemPrompt(context);
    
    // Préparer les messages pour l'IA
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Appel à l'API Groq
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in chat-response function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors du traitement de votre demande',
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

// Construire le prompt système basé sur le contexte
function buildSystemPrompt(context: any): string {
  const completionLevel = calculateCompletionLevel(context);
  
  let basePrompt = `Tu es un assistant IA spécialisé dans l'immobilier au Mali. Tu aides les utilisateurs avec la gestion de propriétés, la création de contrats de location, et les questions immobilières.

Contexte actuel:
- Niveau de complétion: ${completionLevel}%
- Type de document: ${context.documentType || 'Non spécifié'}
`;

  if (context.tenantName) basePrompt += `- Nom du locataire: ${context.tenantName}\n`;
  if (context.propertyAddress) basePrompt += `- Adresse du bien: ${context.propertyAddress}\n`;
  if (context.rentAmount) basePrompt += `- Loyer mensuel: ${context.rentAmount} FCFA\n`;
  if (context.securityDeposit) basePrompt += `- Dépôt de garantie: ${context.securityDeposit} FCFA\n`;

  basePrompt += `
Instructions:
1. Réponds de manière professionnelle et utile
2. Si des informations manquent pour un contrat, demande-les poliment
3. Utilise un langage adapté au contexte malien
4. Propose des solutions pratiques et légales
5. Sois concis mais complet dans tes réponses

Réponds en français et adapte-toi au contexte de l'immobilier au Mali.`;

  return basePrompt;
}

function calculateCompletionLevel(context: any): number {
  const requiredFields = ['tenantName', 'propertyAddress', 'rentAmount', 'securityDeposit'];
  const completedFields = requiredFields.filter(field => context[field]).length;
  return Math.round((completedFields / requiredFields.length) * 100);
}

// Fonction pour générer le document HTML avec l'IA
async function generateDocumentResponse(conversationHistory: any[], context: any, corsHeaders: any) {
  try {
    console.log('=== GÉNÉRATION DOCUMENT ===');
    console.log('Context reçu:', context);
    console.log('Conversation history:', conversationHistory.length, 'messages');

    // Extraire les informations de la conversation complète
    const extractedInfo = extractInfoFromConversation(conversationHistory, context);
    console.log('Informations extraites:', extractedInfo);

    // Vérifier que les données essentielles sont présentes
    const tenantName = extractedInfo.tenantName;
    const propertyAddress = extractedInfo.propertyAddress;
    const rentAmount = extractedInfo.rentAmount;
    const securityDeposit = extractedInfo.securityDeposit;
    const leaseDuration = extractedInfo.leaseDuration || '12 mois';

    console.log('=== DONNÉES POUR PROMPT ===');
    console.log('tenantName:', tenantName);
    console.log('propertyAddress:', propertyAddress);
    console.log('rentAmount:', rentAmount);
    console.log('securityDeposit:', securityDeposit);
    console.log('leaseDuration:', leaseDuration);

    // Validation stricte des données
    if (!tenantName || !propertyAddress || !rentAmount) {
      return new Response(
        JSON.stringify({
          error: `ERREUR: Impossible de générer le contrat. Données manquantes:
${!tenantName ? '- Nom du locataire manquant' : ''}
${!propertyAddress ? '- Adresse du bien manquante' : ''}
${!rentAmount ? '- Montant du loyer manquant' : ''}

Veuillez fournir ces informations dans le chat avant de générer le contrat.`,
          success: false
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Générer le document avec l'IA
    const documentContent = await generateDocumentWithAI(conversationHistory, extractedInfo);
    
    return new Response(
      JSON.stringify({ 
        documentHtml: documentContent,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erreur génération document:', error);
    
    // Fallback vers template basique
    const fallbackContent = getBasicContractTemplate(context);
    
    return new Response(
      JSON.stringify({ 
        documentHtml: fallbackContent,
        success: true,
        fallback: true
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
}

// Extraire les informations de toute la conversation
function extractInfoFromConversation(conversationHistory: any[], context: any) {
  console.log('=== EXTRACTION DEBUG ===');
  console.log('Context reçu:', context);
  console.log('Messages à analyser:', conversationHistory.length);

  // Ignorer le contexte passé, extraire UNIQUEMENT depuis la conversation
  const baseContext = { documentType: context?.documentType || 'contract' };
  let extractedInfo = { ...baseContext };

  // Patterns pour extraire les informations
  const namePatterns = [
    /([a-zà-ÿ]+\s+[a-zà-ÿ]+)/i,
    /je\s+suis\s+([a-zà-ÿ\s]+)/i,
    /mon\s+nom\s+est\s+([a-zà-ÿ\s]+)/i,
    /appelle\s+([a-zà-ÿ\s]+)/i,
  ];

  const amountPatterns = [
    /(\d+)(?:\s*(?:fcfa|\/mois|euros?|f))/i,
    /loyer.*?(\d+)/i,
    /montant.*?(\d+)/i,
    /(\d+).*?par\s+mois/i,
    /caution.*?(\d+)/i
  ];

  const addressPatterns = [
    /(?:bamako|adresse)[,\s]+([a-zà-ÿ\s,]+)/i,
    /quartier\s+([a-zà-ÿ\s]+)/i,
    /à\s+([a-zà-ÿ\s,]+bamako)/i,
    /situé.*?([a-zà-ÿ\s,]+)/i
  ];

  // Analyser chaque message
  conversationHistory.forEach((message, index) => {
    if (!message.content) return;
    
    const content = message.content.toLowerCase().trim();
    console.log(`Message ${index}:`, content);

    // Extraction du nom du locataire
    if (message.isUser && !extractedInfo.tenantName) {
      for (const pattern of namePatterns) {
        const match = content.match(pattern);
        if (match) {
          const extractedName = match[1].trim().toUpperCase();
          if (extractedName.length > 2 && extractedName.split(' ').length >= 2) {
            extractedInfo.tenantName = extractedName;
            extractedInfo.clientName = extractedName;
            console.log('Nom locataire extrait:', extractedName);
            break;
          }
        }
      }
    }

    // Extraction des montants
    if (message.isUser) {
      for (const pattern of amountPatterns) {
        const match = content.match(pattern);
        if (match) {
          const amount = parseInt(match[1]);
          if (amount > 0) {
            if (content.includes('caution') || content.includes('garantie') || content.includes('dépôt')) {
              if (!extractedInfo.securityDeposit) {
                extractedInfo.securityDeposit = amount;
                console.log('Caution extraite:', amount);
              }
            } else if (content.includes('loyer') || content.includes('/mois') || content.includes('par mois')) {
              if (!extractedInfo.rentAmount) {
                extractedInfo.rentAmount = amount;
                console.log('Loyer extrait:', amount);
              }
            } else if (!extractedInfo.rentAmount) {
              extractedInfo.rentAmount = amount;
              console.log('Montant extrait comme loyer:', amount);
            }
          }
        }
      }
    }

    // Extraction de l'adresse
    if (message.isUser && !extractedInfo.propertyAddress) {
      for (const pattern of addressPatterns) {
        const match = content.match(pattern);
        if (match) {
          const address = match[1].trim();
          if (address.length > 3) {
            extractedInfo.propertyAddress = address;
            console.log('Adresse extraite:', address);
            break;
          }
        }
      }
    }

    // Extraction de la durée
    if (message.isUser && !extractedInfo.leaseDuration) {
      const durationMatch = content.match(/(\d+)\s*(mois|an|année)/i);
      if (durationMatch) {
        const duration = `${durationMatch[1]} ${durationMatch[2]}`;
        extractedInfo.leaseDuration = duration;
        console.log('Durée extraite:', duration);
      }
    }
  });

  console.log('=== RÉSULTAT EXTRACTION ===');
  console.log('Informations finales extraites:', extractedInfo);

  return extractedInfo;
}

// Générer un document complet avec l'IA
async function generateDocumentWithAI(conversationHistory: any[], extractedInfo: any) {
  try {
    const documentPrompt = buildDocumentGenerationPrompt(conversationHistory, extractedInfo);
    
    const messages = [
      { role: 'user', content: documentPrompt }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: messages,
        temperature: 0.3,
        max_tokens: 4000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || '';
    
    return wrapInA4Html(generatedContent);

  } catch (error) {
    console.error('Erreur génération IA:', error);
    throw error;
  }
}

// Construire le prompt pour la génération de document
function buildDocumentGenerationPrompt(conversationHistory: any[], extractedInfo: any) {
  const tenantName = extractedInfo.tenantName;
  const propertyAddress = extractedInfo.propertyAddress;
  const rentAmount = extractedInfo.rentAmount;
  const securityDeposit = extractedInfo.securityDeposit || rentAmount;
  const leaseDuration = extractedInfo.leaseDuration || '12 mois';

  return `Tu es un expert juriste spécialisé en droit immobilier au Mali. 
Crée un CONTRAT DE LOCATION complet, professionnel et conforme à la législation du Mali.

🚨 RÈGLES ABSOLUES - INTERDICTION TOTALE DES PLACEHOLDERS:
1. Utilise EXACTEMENT le nom "${tenantName}" pour le locataire
2. Utilise EXACTEMENT l'adresse "${propertyAddress}" pour le bien
3. Utilise EXACTEMENT "${rentAmount} FCFA" pour le loyer
4. INTERDIT ABSOLU d'utiliser des placeholders comme [nom du gérant], [nombre de pièces], [superficie]
5. Si une information n'est pas fournie dans le chat, écris "Non spécifié" ou "À déterminer"
6. JAMAIS de crochets [] dans le contrat final
7. Utilise UNIQUEMENT les données réelles du chat

⚠️ IMPORTANT: Tu DOIS utiliser les VRAIES DONNÉES ci-dessous. N'utilise JAMAIS de placeholders comme [NOM] ou [ADRESSE].

DONNÉES RÉELLES À UTILISER OBLIGATOIREMENT:
- Nom du locataire: ${tenantName}
- Adresse du bien: ${propertyAddress}
- Loyer mensuel: ${rentAmount} FCFA
- Dépôt de garantie: ${securityDeposit} FCFA
- Durée: ${leaseDuration}

EXIGENCES:
1. Contrat COMPLET avec toutes les clauses légales nécessaires
2. Conforme à la législation immobilière du Mali
3. Inclure TOUTES les sections obligatoires:
   - Identification des parties
   - Description détaillée du logement
   - Conditions financières complètes
   - Durée et conditions de renouvellement
   - Obligations du bailleur et du locataire
   - Clauses de résiliation
   - Conditions d'état des lieux
   - Dispositions relatives aux réparations
   - Clauses de révision du loyer
   - Modalités de paiement
   - Assurances obligatoires
4. Utiliser un langage juridique professionnel
5. Inclure les références légales appropriées
6. Format structuré et lisible
7. Espaces pour signatures et dates

Génère un contrat complet et professionnel maintenant.`;
}

// Wrapper le contenu dans un HTML A4 propre
function wrapInA4Html(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrat de Location - IMMOO</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .contract-content {
            white-space: pre-wrap;
            word-wrap: break-word;
            max-width: 100%;
        }
        
        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
        
        @media screen {
            body {
                max-width: 21cm;
                margin: 0 auto;
                padding: 2cm;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
        }
    </style>
</head>
<body>
    <div class="contract-content">
${content}
    </div>
</body>
</html>`;
}

function getMissingFields(context: any): string[] {
  const requiredFields = [
    { key: 'tenantName', label: 'Nom du locataire' },
    { key: 'propertyAddress', label: 'Adresse du bien' },
    { key: 'rentAmount', label: 'Montant du loyer' },
    { key: 'securityDeposit', label: 'Dépôt de garantie' }
  ];

  return requiredFields
    .filter(field => !context[field.key])
    .map(field => field.label);
}

// Template basique en cas d'erreur
function getBasicContractTemplate(context: any): string {
  const tenantName = context.tenantName || 'Non spécifié';
  const propertyAddress = context.propertyAddress || 'Non spécifié';
  const rentAmount = context.rentAmount || 'Non spécifié';
  const securityDeposit = context.securityDeposit || rentAmount || 'Non spécifié';

  const contractContent = `CONTRAT DE LOCATION

Entre :
IMMOO AGENCY, représentée par son gérant, Monsieur Non spécifié,
demeurant à Bamako, Mali,
ci-après dénommé "le bailleur",

Et :
${tenantName}, ci-après dénommé "le locataire",

Il a été convenu ce qui suit :

ARTICLE 1 - DÉSIGNATION DU LOGEMENT
Le bailleur loue au locataire un logement situé à ${propertyAddress}.

ARTICLE 2 - DURÉE DE LA LOCATION
La présente location est consentie pour une durée de 12 mois.

ARTICLE 3 - LOYER
Le loyer mensuel est fixé à ${rentAmount} FCFA.

ARTICLE 4 - DÉPÔT DE GARANTIE
Un dépôt de garantie de ${securityDeposit} FCFA est versé à la signature.

ARTICLE 5 - OBLIGATIONS DU LOCATAIRE
Le locataire s'engage à :
- Payer le loyer aux échéances convenues
- Entretenir le logement en bon état
- Respecter le règlement intérieur

ARTICLE 6 - OBLIGATIONS DU BAILLEUR
Le bailleur s'engage à :
- Délivrer le logement en bon état
- Assurer les réparations nécessaires
- Respecter la jouissance paisible du locataire

Fait à Bamako, le _______________

Le Bailleur                    Le Locataire
_____________                  _____________`;

  return wrapInA4Html(contractContent);
}
