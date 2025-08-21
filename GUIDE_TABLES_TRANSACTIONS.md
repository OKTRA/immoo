# 📱 GUIDE DES TABLES DE PAIEMENT IMMOO

## 🔍 **COMPRÉHENSION DES TABLES DE PAIEMENT**

### ❌ **CE QUI N'EST PAS LA TABLE TRANSACTIONS**

La table `transactions` **N'EST PAS** utilisée pour :
- Les paiements de loyer (`apartment_lease_payments`)
- Les paiements de dépôt (`apartment_lease_payments`)
- Les paiements de factures (`expenses`)
- Les paiements de contrats (`contracts`)

### ✅ **CE QU'EST VRAIMENT LA TABLE TRANSACTIONS**

La table `transactions` est **SPÉCIFIQUEMENT** pour :
- **Recevoir les SMS de Muana SMS** (Orange Money, Moov Money, Wave)
- **Traiter les paiements d'abonnement** (plans Starter, Professional, Enterprise)
- **Vérifier les transactions via Edge Functions** (`verify-transaction`, `filter-sms`)

---

## 🏗️ **ARCHITECTURE DES PAIEMENTS IMMOO**

### 1. **PAIEMENTS DE LOYER/DÉPÔT**
```sql
-- Table: apartment_lease_payments
-- Usage: Paiements de loyer mensuel, dépôts de garantie
-- Méthodes: CinetPay, Orange Money, etc.
```

### 2. **PAIEMENTS D'ABONNEMENT**
```sql
-- Table: transactions (Muana SMS)
-- Usage: Paiements des plans d'abonnement
-- Méthodes: Muana SMS (Orange Money, Moov Money, Wave)
```

### 3. **PAIEMENTS DE FACTURES**
```sql
-- Table: expenses
-- Usage: Dépenses de propriété, maintenance
-- Méthodes: Virements bancaires, etc.
```

---

## 📊 **STRUCTURE DE LA TABLE TRANSACTIONS (MUANA SMS)**

### **Colonnes Principales**
```sql
CREATE TABLE transactions (
  -- SMS de base
  sender TEXT NOT NULL,           -- 'OrangeMoney', 'MoovMoney', 'Wave'
  message TEXT NOT NULL,          -- Contenu complet du SMS
  timestamp TIMESTAMPTZ,          -- Heure de réception
  
  -- Déduplication
  fingerprint TEXT UNIQUE,        -- Hash SHA-256 pour éviter les doublons
  
  -- Données extraites
  payment_reference TEXT,         -- Référence extraite du SMS
  amount_cents INTEGER,           -- Montant en centimes
  currency TEXT DEFAULT 'FCFA',   -- Devise (FCFA/XOF)
  counterparty_number TEXT,       -- Numéro de téléphone
  
  -- Métadonnées
  parsed_confidence NUMERIC,      -- Confiance du parsing (0.0 à 1.0)
  parsed_at TIMESTAMPTZ,          -- Heure du parsing
  
  -- Statut
  payment_status TEXT,            -- 'unverified', 'sms_received', 'verified'
  
  -- Vérification
  verified_at TIMESTAMPTZ,        -- Heure de vérification
  verification_attempts INTEGER,   -- Nombre de tentatives
  
  -- Association
  user_id UUID,                   -- Utilisateur qui paie
  plan_id UUID,                   -- Plan d'abonnement acheté
  
  -- Gestion
  created_at TIMESTAMPTZ,         -- Création
  updated_at TIMESTAMPTZ,         -- Mise à jour
  error_message TEXT,             -- Message d'erreur
  metadata JSONB,                 -- Données supplémentaires
  is_test BOOLEAN                 -- Mode test
);
```

---

## 🔄 **WORKFLOW DE PAIEMENT D'ABONNEMENT**

### **Étape 1: Initiation du Paiement**
```typescript
// L'utilisateur sélectionne un plan et initie le paiement
// Une transaction est créée avec user_id et plan_id
```

### **Étape 2: Réception SMS (filter-sms)**
```typescript
// Muana SMS envoie un SMS à filter-sms
// Le SMS est parsé et stocké dans transactions
// fingerprint évite les doublons
```

### **Étape 3: Vérification (verify-transaction)**
```typescript
// L'utilisateur lance la vérification
// verify-transaction cherche une transaction correspondante
// Statut passe de 'unverified' à 'verified'
```

### **Étape 4: Activation de l'Abonnement**
```typescript
// Le plan est activé pour l'utilisateur
// L'accès aux fonctionnalités est débloqué
```

---

## 🚀 **UTILISATION DES SCRIPTS**

### **1. Nouvelle Installation**
```bash
# Script complet avec la vraie structure
.\restore-complete-database.ps1

# Ou script Supabase
# Exécuter restore-supabase.sql dans l'éditeur SQL
```

### **2. Mise à Jour d'une Table Existante**
```sql
-- Si la table transactions existe déjà avec l'ancienne structure
-- Exécuter ce script pour la mettre à jour
\i update-transactions-structure.sql
```

### **3. Ajout de la Table Seulement**
```sql
-- Si vous voulez juste ajouter la table transactions
\i add-transactions-table.sql
```

---

## 🔧 **CONFIGURATION DES EDGE FUNCTIONS**

### **filter-sms**
- **Rôle**: Réception et parsing des SMS
- **Table**: `transactions`
- **Actions**: INSERT avec fingerprint unique

### **verify-transaction**
- **Rôle**: Vérification des transactions
- **Table**: `transactions`
- **Actions**: UPDATE du statut et association user_id/plan_id

---

## 📋 **VÉRIFICATION POST-INSTALLATION**

### **Vérifier la Structure**
```sql
-- Vérifier que la table existe
SELECT table_name FROM information_schema.tables WHERE table_name = 'transactions';

-- Vérifier les colonnes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Vérifier les index
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'transactions';
```

### **Vérifier les Politiques RLS**
```sql
-- Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'transactions';

-- Vérifier les politiques
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'transactions';
```

---

## ⚠️ **POINTS IMPORTANTS**

1. **La table `transactions` est UNIQUEMENT pour les abonnements**
2. **Les paiements de loyer utilisent `apartment_lease_payments`**
3. **Le fingerprint évite les SMS dupliqués**
4. **Les Edge Functions gèrent tout le workflow**
5. **La devise par défaut est FCFA (Mali)**

---

## 🆘 **DÉPANNAGE**

### **Erreur: "column does not exist"**
- Vérifiez que vous avez exécuté le bon script
- Utilisez `update-transactions-structure.sql` si la table existe déjà

### **Erreur: "duplicate key value violates unique constraint"**
- Le fingerprint fonctionne correctement
- Le SMS a déjà été traité

### **Erreur: "relation does not exist"**
- La table n'a pas été créée
- Exécutez `add-transactions-table.sql` ou `restore-database.sql`

---

## 📞 **SUPPORT**

Si vous rencontrez des problèmes :
1. Vérifiez les logs des Edge Functions
2. Vérifiez la structure de la table avec les requêtes de vérification
3. Assurez-vous d'avoir exécuté les scripts dans le bon ordre
