/**
 * 🧪 TESTS FRONTEND - LIMITES D'ABONNEMENT
 * 
 * Script de test pour vérifier le fonctionnement des limites d'abonnement
 * Exécuter dans la console du navigateur sur l'application
 */

// =============================================================================
// 📋 CONFIGURATION DES TESTS
// =============================================================================

const TEST_CONFIG = {
  // Remplacez par un vrai user_id de votre base
  TEST_USER_ID: 'test-user-001',
  
  // Types de ressources à tester
  RESOURCE_TYPES: ['agencies', 'properties', 'leases', 'users'],
  
  // URL de base de l'API (ajustez selon votre config)
  API_BASE: window.location.origin
};

// =============================================================================
// 🛠️ UTILITAIRES DE TEST
// =============================================================================

class SubscriptionTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    switch(type) {
      case 'success':
        console.log(`✅ ${logEntry}`);
        break;
      case 'error':
        console.error(`❌ ${logEntry}`);
        this.errors.push(logEntry);
        break;
      case 'warning':
        console.warn(`⚠️ ${logEntry}`);
        break;
      default:
        console.log(`🔍 ${logEntry}`);
    }
    
    this.results.push({ timestamp, message, type });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simuler l'import des services (remplacez par vos vrais imports)
  async checkUserResourceLimit(userId, resourceType) {
    try {
      // Ici vous devez utiliser votre vrai service
      // Exemple avec fetch vers votre API Supabase
      
      const { createClient } = window.supabase || {};
      if (!createClient) {
        throw new Error('Supabase client non disponible');
      }

      // Simulation - remplacez par votre vraie logique
      return {
        resourceType,
        currentCount: Math.floor(Math.random() * 10),
        maxAllowed: Math.floor(Math.random() * 5) + 1,
        allowed: Math.random() > 0.3,
        percentageUsed: Math.floor(Math.random() * 100),
        planName: 'Test Plan',
        isUnlimited: Math.random() > 0.8
      };
    } catch (error) {
      this.log(`Erreur lors de la vérification de ${resourceType}: ${error.message}`, 'error');
      return null;
    }
  }
}

// =============================================================================
// 🧪 TESTS DES LIMITES
// =============================================================================

class LimitTests extends SubscriptionTester {
  async runAllTests() {
    this.log('🚀 Début des tests des limites d\'abonnement');
    
    await this.testResourceLimits();
    await this.testUnlimitedPlans();
    await this.testLimitValidation();
    await this.testUIComponents();
    
    this.showResults();
  }

  async testResourceLimits() {
    this.log('📊 Test 1: Vérification des limites par ressource');
    
    for (const resourceType of TEST_CONFIG.RESOURCE_TYPES) {
      this.log(`Vérification des limites pour: ${resourceType}`);
      
      const limit = await this.checkUserResourceLimit(
        TEST_CONFIG.TEST_USER_ID, 
        resourceType
      );
      
      if (limit) {
        this.log(`${resourceType}: ${limit.currentCount}/${limit.maxAllowed} (${limit.percentageUsed}%)`, 
          limit.allowed ? 'success' : 'warning');
      }
      
      await this.delay(500); // Éviter le spam
    }
  }

  async testUnlimitedPlans() {
    this.log('♾️ Test 2: Vérification des plans illimités');
    
    // Simuler un plan illimité
    const unlimitedLimit = {
      resourceType: 'properties',
      currentCount: 150,
      maxAllowed: -1,
      allowed: true,
      percentageUsed: 0,
      planName: 'Premium Plan',
      isUnlimited: true
    };

    this.log('Test plan illimité:', 'info');
    this.log(`- Ressources actuelles: ${unlimitedLimit.currentCount}`);
    this.log(`- Limite max: ${unlimitedLimit.maxAllowed === -1 ? 'Illimité' : unlimitedLimit.maxAllowed}`);
    this.log(`- Autorisé: ${unlimitedLimit.allowed ? 'Oui' : 'Non'}`, unlimitedLimit.allowed ? 'success' : 'error');
    this.log(`- Pourcentage: ${unlimitedLimit.percentageUsed}%`);
  }

  async testLimitValidation() {
    this.log('🔒 Test 3: Validation des limites');
    
    const testCases = [
      { current: 0, max: 5, shouldAllow: true, description: 'Début utilisation' },
      { current: 3, max: 5, shouldAllow: true, description: 'Utilisation normale' },
      { current: 4, max: 5, shouldAllow: true, description: 'Proche limite' },
      { current: 5, max: 5, shouldAllow: false, description: 'Limite atteinte' },
      { current: 10, max: -1, shouldAllow: true, description: 'Plan illimité' }
    ];

    testCases.forEach(testCase => {
      const allowed = testCase.max === -1 || testCase.current < testCase.max;
      const passed = allowed === testCase.shouldAllow;
      
      this.log(`${testCase.description}: ${testCase.current}/${testCase.max === -1 ? '∞' : testCase.max} - ${allowed ? 'Autorisé' : 'Bloqué'}`, 
        passed ? 'success' : 'error');
    });
  }

  async testUIComponents() {
    this.log('🎨 Test 4: Composants UI des limites');
    
    // Tester si les composants de limite existent
    const components = [
      { selector: '[data-testid="limit-warning"]', name: 'LimitWarning' },
      { selector: '[data-testid="subscription-limits"]', name: 'SubscriptionLimits' },
      { selector: '.limit-progress', name: 'Progress bars' },
      { selector: 'button[disabled]', name: 'Boutons désactivés' }
    ];

    components.forEach(component => {
      const elements = document.querySelectorAll(component.selector);
      if (elements.length > 0) {
        this.log(`${component.name}: ${elements.length} élément(s) trouvé(s)`, 'success');
      } else {
        this.log(`${component.name}: Aucun élément trouvé`, 'warning');
      }
    });
  }

  showResults() {
    this.log('📋 Résumé des tests');
    this.log(`Total tests: ${this.results.length}`);
    this.log(`Erreurs: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      this.log('❌ Erreurs détectées:', 'error');
      this.errors.forEach(error => console.error(error));
    } else {
      this.log('✅ Tous les tests passés!', 'success');
    }

    // Créer un rapport détaillé
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      errors: this.errors.length,
      results: this.results
    };

    console.table(this.results);
    return report;
  }
}

// =============================================================================
// 🎯 TESTS SPÉCIFIQUES AUX HOOKS
// =============================================================================

class HookTests extends SubscriptionTester {
  async testUseResourceGuard() {
    this.log('🛡️ Test du hook useResourceGuard');
    
    // Vérifier si React et les hooks sont disponibles
    if (typeof React === 'undefined') {
      this.log('React non disponible - test hook ignoré', 'warning');
      return;
    }

    // Test simulation d'un guard
    const mockGuard = {
      canCreateResource: async (resourceType) => {
        this.log(`Vérification guard pour: ${resourceType}`);
        return Math.random() > 0.5; // Simulation
      },
      isChecking: false
    };

    for (const resourceType of TEST_CONFIG.RESOURCE_TYPES) {
      const canCreate = await mockGuard.canCreateResource(resourceType);
      this.log(`Guard ${resourceType}: ${canCreate ? 'Autorisé' : 'Bloqué'}`, 
        canCreate ? 'success' : 'warning');
    }
  }

  async testUseSubscriptionLimits() {
    this.log('📊 Test du hook useSubscriptionLimits');
    
    // Simuler les données du hook
    const mockLimits = {
      properties: { currentCount: 3, maxAllowed: 10, allowed: true, percentageUsed: 30 },
      agencies: { currentCount: 1, maxAllowed: 1, allowed: false, percentageUsed: 100 },
      leases: { currentCount: 5, maxAllowed: -1, allowed: true, percentageUsed: 0 },
      users: { currentCount: 2, maxAllowed: 5, allowed: true, percentageUsed: 40 },
      anyLimitReached: true
    };

    this.log('Limites simulées:');
    Object.entries(mockLimits).forEach(([key, value]) => {
      if (typeof value === 'object' && value.currentCount !== undefined) {
        this.log(`- ${key}: ${value.currentCount}/${value.maxAllowed === -1 ? '∞' : value.maxAllowed} (${value.percentageUsed}%)`,
          value.allowed ? 'success' : 'warning');
      }
    });
  }
}

// =============================================================================
// 🚀 LANCEMENT DES TESTS
// =============================================================================

async function runSubscriptionTests() {
  console.clear();
  console.log('🧪 TESTS DES LIMITES D\'ABONNEMENT - DÉBUT');
  console.log('='.repeat(50));

  const limitTests = new LimitTests();
  const hookTests = new HookTests();

  // Tests des limites
  await limitTests.runAllTests();
  
  console.log('\n' + '='.repeat(50));
  
  // Tests des hooks
  await hookTests.testUseResourceGuard();
  await hookTests.testUseSubscriptionLimits();

  console.log('\n' + '='.repeat(50));
  console.log('🧪 TESTS TERMINÉS');
  
  return {
    limitTests: limitTests.results,
    hookTests: hookTests.results
  };
}

// =============================================================================
// 📋 TESTS MANUELS À EFFECTUER
// =============================================================================

function showManualTestInstructions() {
  console.log(`
🔧 TESTS MANUELS À EFFECTUER :

1. 📱 Tests d'interface utilisateur :
   - Aller sur /agencies
   - Vérifier l'affichage des limites
   - Essayer de créer une agence quand limite atteinte
   - Vérifier les alertes LimitWarning

2. 🔄 Tests d'upgrade :
   - Aller sur /pricing
   - Simuler un upgrade de plan
   - Vérifier que les nouvelles limites s'appliquent

3. 🎯 Tests par ressource :
   - Créer propriétés jusqu'à la limite
   - Créer baux jusqu'à la limite
   - Ajouter utilisateurs jusqu'à la limite
   - Vérifier les compteurs en temps réel

4. ♾️ Tests plans illimités :
   - Activer un plan avec limites -1
   - Vérifier affichage "Illimité"
   - Créer plus de ressources que limite normale
   - Vérifier que tout fonctionne

5. 🚨 Tests d'erreur :
   - Désactiver JavaScript
   - Modifier les limites en base pendant utilisation
   - Tester avec connexion lente

Pour lancer les tests automatiques :
> runSubscriptionTests()
  `);
}

// =============================================================================
// 📤 EXPORT DES FONCTIONS
// =============================================================================

if (typeof window !== 'undefined') {
  // Browser environment
  window.runSubscriptionTests = runSubscriptionTests;
  window.showManualTestInstructions = showManualTestInstructions;
  window.SubscriptionTester = SubscriptionTester;
  window.LimitTests = LimitTests;
  window.HookTests = HookTests;
  
  console.log('✅ Tests d\'abonnement chargés !');
  console.log('Tapez runSubscriptionTests() pour commencer');
  console.log('Tapez showManualTestInstructions() pour voir les tests manuels');
}

if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    runSubscriptionTests,
    showManualTestInstructions,
    SubscriptionTester,
    LimitTests,
    HookTests
  };
} 