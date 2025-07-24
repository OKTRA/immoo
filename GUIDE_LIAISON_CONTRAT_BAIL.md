# 🔗 Guide : Liaison Simple Contrat-Bail

## ✅ Fonctionnalités Implémentées

### 📋 **1. Depuis les Baux → Voir le Contrat**
- **Où :** Dans toutes les listes de baux (`LeaseList`, `AgencyLeasesDisplay`)
- **Bouton :** "Contrat" (icône œil 👁️)
- **Action :** Ouvre un popup avec le contrat complet rattaché au bail

### 📄 **2. Depuis les Contrats → Rattacher un Bail**
- **Où :** Dans la liste des contrats (`ContractsListPage`)
- **Bouton :** Icône de lien 🔗 (visible seulement si le contrat n'est pas encore rattaché)
- **Action :** Ouvre un popup pour choisir un bail disponible et le rattacher

## 🛠️ Composants Créés

### 📁 **Nouveaux Fichiers**
```
src/components/contracts/ContractViewDialog.tsx     # Popup d'affichage du contrat
src/components/contracts/AttachLeaseDialog.tsx     # Popup de rattachement
src/services/contracts/leaseContractService.ts     # Services de liaison
```

### 🔄 **Fichiers Modifiés**
```
src/components/leases/LeaseList.tsx                # + Bouton "Contrat"
src/components/leases/AgencyLeasesDisplay.tsx      # + Bouton "Contrat"
src/pages/contracts/ContractsListPage.tsx          # + Bouton "Rattacher"
```

## 🧪 Test de la Fonctionnalité

### **1. Vérifier que les Boutons Sont Visibles**
- Allez dans la liste des baux
- Vous devriez voir un bouton "Contrat" sur chaque ligne
- Allez dans la liste des contrats
- Vous devriez voir un bouton 🔗 pour les contrats non rattachés

### **2. Tester la Récupération de Contrat**
- Utilisez le composant de test : `ContractLeaseTest.tsx`
- Trouvez un ID de bail dans votre base de données
- Testez la récupération

### **3. Tester le Rattachement**
- Créez un contrat (sans bail)
- Créez un bail (sans contrat)
- Utilisez le bouton 🔗 pour les rattacher
- Vérifiez que le bouton "Contrat" sur le bail fonctionne

## 🔧 Services Disponibles

### **`leaseContractService.ts`**
```typescript
// Récupérer le contrat d'un bail
getContractByLeaseId(leaseId: string)

// Vérifier si un bail a un contrat
hasContract(leaseId: string)

// Rattacher un contrat à un bail
attachContractToLease(contractId: string, leaseId: string)

// Détacher un contrat d'un bail
detachContractFromLease(contractId: string)

// Récupérer les contrats non rattachés
getUnattachedContracts(agencyId: string)
```

## 🎯 Utilisation Simple

### **Pour l'Utilisateur :**
1. **Voir un contrat depuis un bail :** Clic sur "Contrat" → Popup s'ouvre
2. **Rattacher un contrat à un bail :** Clic sur 🔗 → Choisir bail → Rattacher

### **Pas de Navigation Compliquée :**
- Tout se fait en popup
- Pas de redirection
- Interface simple et directe

## 🐛 Dépannage

### **Si les boutons ne s'affichent pas :**
1. Vérifiez que les imports sont corrects
2. Vérifiez la console du navigateur
3. Assurez-vous que la table `leases` existe dans la BD

### **Si les contrats ne se chargent pas :**
1. Vérifiez que la table `contracts` a la colonne `lease_id`
2. Vérifiez les relations dans Supabase
3. Consultez les logs de la console

### **Structure de BD Requise :**
```sql
-- Table contracts doit avoir :
ALTER TABLE contracts ADD COLUMN lease_id UUID REFERENCES leases(id);

-- Index pour performance :
CREATE INDEX idx_contracts_lease_id ON contracts(lease_id);
```

## 📝 Notes Techniques

- **Tables utilisées :** `contracts`, `leases`, `properties`, `tenants`
- **Relations :** `contracts.lease_id` → `leases.id`
- **Sécurité :** RLS policies respectées
- **Performance :** Requêtes optimisées avec indexes

---

✅ **La liaison contrat-bail est maintenant simple et fonctionnelle !** 