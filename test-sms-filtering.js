// Script de test pour le filtrage intelligent des SMS
// Ce script teste la fonction filter-sms avec différents types de SMS

const SUPABASE_URL = 'https://igpgjiduhdwoobbjnshq.supabase.co';
const FILTER_SMS_URL = `${SUPABASE_URL}/functions/v1/filter-sms`;

// Exemples de SMS à tester
const testSMS = [
  {
    name: 'SMS Marketing Orange Money',
    sender: 'Orange',
    message: 'Orange Money c\'est simple ! Transférez ou recevez de l\'argent partout au Mali. Appelez le #144# pour plus d\'infos.',
    expected: 'MARKETING'
  },
  {
    name: 'SMS Promotion MTN',
    sender: 'MTN',
    message: 'Félicitations ! Profitez de nos tarifs réduits sur les transferts MTN Money. 50% de réduction jusqu\'au 31 décembre.',
    expected: 'MARKETING'
  },
  {
    name: 'SMS Information générale',
    sender: 'Orange',
    message: 'INFOS ! Cher client, nous dénonçons les fausses informations circulant sur les réseaux sociaux concernant Orange Money.',
    expected: 'MARKETING'
  },
  {
    name: 'Vraie Transaction Orange Money',
    sender: 'Orange',
    message: 'Transfert de 5000 FCFA du 77123456 effectué avec succès. ID: ABC123. Frais: 50 FCFA.',
    expected: 'TRANSACTION'
  },
  {
    name: 'Vraie Transaction MTN Money',
    sender: 'MTN',
    message: 'You have received 2500 XOF from +22377654321. Transaction ID: TXN789. Balance: 15000 XOF.',
    expected: 'TRANSACTION'
  },
  {
    name: 'Retrait Orange Money',
    sender: 'Orange',
    message: 'Retrait de 10000 FCFA effectué avec succès. Frais: 100 FCFA. Référence: REF456789. Solde: 25000 FCFA.',
    expected: 'TRANSACTION'
  },
  {
    name: 'Paiement marchand',
    sender: 'Orange',
    message: 'Paiement de 3000 FCFA pour BOUTIQUE XYZ réussi. Code: PAY001. Merci pour votre achat.',
    expected: 'TRANSACTION'
  }
];

async function testSMSFiltering() {
  console.log('🧪 Test du filtrage intelligent des SMS\n');
  
  let passed = 0;
  let total = testSMS.length;
  
  for (const test of testSMS) {
    console.log(`📱 Test: ${test.name}`);
    console.log(`   Message: "${test.message.substring(0, 60)}..."`);
    console.log(`   Attendu: ${test.expected}`);
    
    try {
      const response = await fetch(FILTER_SMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY' // Remplacer par votre clé
        },
        body: JSON.stringify({
          sender: test.sender,
          message: test.message,
          timestamp: new Date().toISOString()
        })
      });
      
      const result = await response.json();
      
      let actualResult;
      if (result.filtered === true) {
        actualResult = 'MARKETING';
      } else if (result.success === true && result.data) {
        actualResult = 'TRANSACTION';
      } else {
        actualResult = 'ERREUR';
      }
      
      const isCorrect = actualResult === test.expected;
      if (isCorrect) {
        console.log(`   ✅ Résultat: ${actualResult}`);
        passed++;
      } else {
        console.log(`   ❌ Résultat: ${actualResult} (attendu: ${test.expected})`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    console.log('');
    
    // Pause entre les tests pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Résultats: ${passed}/${total} tests réussis (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 Tous les tests sont passés ! Le filtrage intelligent fonctionne correctement.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration Groq AI.');
  }
}

// Instructions d'utilisation
console.log('📋 Instructions:');
console.log('1. Remplacez YOUR_SUPABASE_ANON_KEY par votre clé Supabase');
console.log('2. Configurez GROQ_API_KEY dans vos secrets Supabase');
console.log('3. Exécutez: node test-sms-filtering.js\n');

// Décommenter pour exécuter les tests
// testSMSFiltering();