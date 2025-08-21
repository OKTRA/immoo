# 🚀 GUIDE DE RESTAURATION RAPIDE - BASE IMMOO

## ⚡ RESTAURATION EN 3 ÉTAPES SIMPLES

### 🎯 OPTION 1: SUPABASE (RECOMMANDÉE)
Si vous utilisez Supabase, c'est le plus simple :

1. **Ouvrir Supabase Dashboard**
2. **Aller dans SQL Editor**
3. **Copier-coller le contenu de `restore-supabase.sql`**
4. **Cliquer sur "Run"**

✅ **C'est tout ! Votre base est restaurée.**

---

### 🖥️ OPTION 2: WINDOWS (PowerShell)
Si vous avez PostgreSQL installé localement :

1. **Ouvrir PowerShell en tant qu'administrateur**
2. **Naviguer vers votre projet :**
   ```powershell
   cd C:\Users\Ousma\Desktop\DEV\immoo
   ```
3. **Exécuter le script :**
   ```powershell
   .\restore-complete-database.ps1
   ```

---

### 🐧 OPTION 3: LINUX/MAC (Terminal)
1. **Ouvrir un terminal**
2. **Naviguer vers votre projet :**
   ```bash
   cd /path/to/immoo
   ```
3. **Rendre le script exécutable :**
   ```bash
   chmod +x restore-complete-database.sh
   ```
4. **Exécuter le script :**
   ```bash
   ./restore-complete-database.sh
   ```

---

### 🔧 OPTION 4: MANUELLE (Si les autres échouent)
Exécuter ces commandes une par une :

```bash
# Étape 1: Restauration de base
psql -d postgres -f restore-database.sql

# Étape 2: Migrations avancées
psql -d postgres -f apply-advanced-migrations.sql

# Étape 3: Vérification
psql -d postgres -f verify-restoration.sql
```

---

## 🆘 PROBLÈMES COURANTS

### ❌ "psql command not found"
**Solution :** Installer PostgreSQL
- **Windows :** https://www.postgresql.org/download/windows/
- **Mac :** `brew install postgresql`
- **Linux :** `sudo apt-get install postgresql-client`

### ❌ "Permission denied"
**Solution :** Exécuter en tant qu'administrateur
- **Windows :** PowerShell en tant qu'administrateur
- **Linux/Mac :** `sudo ./restore-complete-database.sh`

### ❌ "Database connection failed"
**Solution :** Vérifier que PostgreSQL est démarré
```bash
# Tester la connexion
psql -d postgres -c "SELECT 1;"
```

---

## ✅ VÉRIFICATION POST-RESTAURATION

Après la restauration, vérifiez que :

1. **✅ L'application web se lance** sans erreurs
2. **✅ L'authentification fonctionne** (inscription/connexion)
3. **✅ Vous pouvez créer** une agence de test
4. **✅ Vous pouvez créer** une propriété de test
5. **✅ Les plans d'abonnement** s'affichent

---

## 📞 SUPPORT

**Si rien ne fonctionne :**

1. **Vérifiez les logs** d'erreur
2. **Testez la connexion** manuellement avec psql
3. **Vérifiez que PostgreSQL** est bien installé et démarré
4. **Consultez le README complet** : `RESTORE_DATABASE_README.md`

---

## 🎉 FÉLICITATIONS !

Une fois la restauration terminée, votre base de données IMMOO sera entièrement fonctionnelle avec :
- Toutes les tables et vues
- Système d'abonnement complet
- Sécurité RLS activée
- Données de base (plans, méthodes de paiement Mali)
- Index de performance

**Votre application est prête à fonctionner !** 🚀
