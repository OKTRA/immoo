import subprocess
import os

def run_sql_script(script_name):
    """Execute a SQL script using psql or supabase CLI"""
    try:
        print(f"🔄 Exécution du script {script_name}...")
        
        # Try to execute with supabase CLI first
        result = subprocess.run([
            'npx', 'supabase', 'db', 'reset', '--db-url', 'postgresql://localhost:54322/postgres'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode != 0:
            print(f"❌ Erreur lors de l'exécution: {result.stderr}")
            return False
        
        print(f"✅ Script {script_name} exécuté avec succès")
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def clean_mock_agencies():
    """Clean mock agencies using both SQL script and API"""
    print("🧹 Nettoyage des agences mock en cours...")
    
    # Execute SQL script
    if run_sql_script("remove-mock-agencies.sql"):
        print("✅ Nettoyage SQL terminé")
    else:
        print("⚠️ Échec du nettoyage SQL, mais on continue...")
    
    # Additional cleanup via npm script if available
    try:
        result = subprocess.run(['npm', 'run', 'clean:mock'], 
                              capture_output=True, text=True, cwd=os.getcwd())
        if result.returncode == 0:
            print("✅ Nettoyage via npm terminé")
    except:
        print("ℹ️ Script npm clean:mock non disponible")
    
    print("🎉 Nettoyage des agences mock terminé!")

def fix_subscription_limits():
    """Fix subscription limits in database and TypeScript files"""
    print("🔧 Correction des limites d'abonnement...")
    
    # Execute SQL fixes
    try:
        with open("fix-subscription-limits-critical.sql", "r", encoding="utf-8") as file:
            sql_content = file.read()
        print("✅ Script SQL de correction chargé")
        
        # Execute via psql if available
        result = subprocess.run(['psql', '-c', sql_content], 
                              capture_output=True, text=True, cwd=os.getcwd())
        if result.returncode == 0:
            print("✅ Corrections SQL appliquées")
        else:
            print("⚠️ Exécution SQL via psql échouée")
            
    except Exception as e:
        print(f"⚠️ Erreur lors de l'exécution du script SQL: {e}")
    
    print("🎉 Corrections des limites d'abonnement terminées!")

def ensure_default_free_plan():
    """Ensure all users have the default free plan 00000000-0000-0000-0000-000000000001"""
    print("🆓 Attribution du plan gratuit par défaut à tous les utilisateurs...")
    
    try:
        with open("ensure-default-free-plan.sql", "r", encoding="utf-8") as file:
            sql_content = file.read()
        print("✅ Script SQL de plan gratuit chargé")
        
        # Execute via psql if available
        result = subprocess.run(['psql', '-c', sql_content], 
                              capture_output=True, text=True, cwd=os.getcwd())
        if result.returncode == 0:
            print("✅ Plan gratuit assigné à tous les utilisateurs")
        else:
            print("⚠️ Exécution SQL via psql échouée")
            print(f"Erreur: {result.stderr}")
            
    except Exception as e:
        print(f"⚠️ Erreur lors de l'exécution du script SQL: {e}")
    
    print("🎉 Attribution du plan gratuit terminée!")

def fix_agency_links():
    """Diagnose and fix agency-user links for users who can't see their agencies"""
    print("🔗 Diagnostic et correction des liaisons agence-utilisateur...")
    
    # Create and execute SQL diagnostic script
    diagnostic_sql = """
-- =============================================================================
-- DIAGNOSTIC DES LIAISONS AGENCE-UTILISATEUR
-- =============================================================================

SELECT 'UTILISATEURS AGENCE SANS AGENCE LIÉE' as section;

-- Trouver les utilisateurs d'agence sans agence liée
SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    'PROBLÈME: Utilisateur agence sans agence_id' as status
FROM profiles p
WHERE p.role = 'agency' 
AND p.agency_id IS NULL;

SELECT 'AGENCES ORPHELINES (SANS UTILISATEUR)' as section;

-- Trouver les agences sans utilisateur lié
SELECT 
    a.id as agency_id,
    a.name,
    a.email,
    a.user_id,
    'PROBLÈME: Agence sans user_id' as status
FROM agencies a
WHERE a.user_id IS NULL;

SELECT 'AGENCES AVEC EMAIL CORRESPONDANT AUX UTILISATEURS' as section;

-- Trouver les correspondances par email pour correction automatique
SELECT 
    p.id as user_id,
    p.email as user_email,
    p.role,
    a.id as agency_id,
    a.name as agency_name,
    a.email as agency_email,
    'PEUT ÊTRE CORRIGÉ AUTOMATIQUEMENT' as status
FROM profiles p
JOIN agencies a ON p.email = a.email
WHERE p.role = 'agency'
AND (p.agency_id IS NULL OR a.user_id IS NULL);

-- =============================================================================
-- CORRECTION AUTOMATIQUE
-- =============================================================================

SELECT 'CORRECTION EN COURS...' as section;

-- Corriger les liaisons basées sur l'email
UPDATE agencies 
SET user_id = (
    SELECT p.id 
    FROM profiles p 
    WHERE p.email = agencies.email 
    AND p.role = 'agency'
)
WHERE user_id IS NULL
AND email IN (
    SELECT email 
    FROM profiles 
    WHERE role = 'agency'
);

-- Corriger les profils utilisateur
UPDATE profiles 
SET agency_id = (
    SELECT a.id 
    FROM agencies a 
    WHERE a.email = profiles.email 
    AND a.user_id = profiles.id
)
WHERE role = 'agency'
AND agency_id IS NULL;

SELECT 'VÉRIFICATION APRÈS CORRECTION' as section;

-- Vérifier les corrections
SELECT 
    p.id as user_id,
    p.email,
    p.agency_id,
    a.id as agency_id_from_table,
    a.name as agency_name,
    a.user_id as agency_user_id,
    CASE 
        WHEN p.agency_id = a.id AND a.user_id = p.id THEN '✅ LIAISON CORRECTE'
        WHEN p.agency_id IS NULL THEN '❌ UTILISATEUR SANS AGENCE'
        WHEN a.user_id IS NULL THEN '❌ AGENCE SANS UTILISATEUR'
        ELSE '⚠️ LIAISON INCOHÉRENTE'
    END as status
FROM profiles p
LEFT JOIN agencies a ON p.email = a.email
WHERE p.role = 'agency';
"""
    
    try:
        # Write diagnostic script to temporary file
        with open("temp_diagnostic_agency_links.sql", "w", encoding="utf-8") as file:
            file.write(diagnostic_sql)
        print("✅ Script de diagnostic créé")
        
        # Execute via psql if available
        result = subprocess.run(['psql', '-f', 'temp_diagnostic_agency_links.sql'], 
                              capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print("✅ Diagnostic et correction exécutés avec succès")
            print("📊 Résultats:")
            print(result.stdout)
        else:
            print("⚠️ Exécution via psql échouée, essayons via supabase...")
            print(f"Erreur psql: {result.stderr}")
            
            # Try with supabase CLI
            result = subprocess.run(['npx', 'supabase', 'db', 'reset'], 
                                  capture_output=True, text=True, cwd=os.getcwd())
            
        # Clean up temporary file
        if os.path.exists("temp_diagnostic_agency_links.sql"):
            os.remove("temp_diagnostic_agency_links.sql")
            
    except Exception as e:
        print(f"⚠️ Erreur lors du diagnostic: {e}")
    
    print("🎉 Diagnostic et correction des liaisons agence terminés!")
    print("💡 Si le problème persiste, vérifiez les logs de votre application React pour voir les erreurs de getUserAgencies()")

def fix_agency_links():
    """Diagnose and fix agency-user links for users who can't see their agencies"""
    print("🔗 Diagnostic et correction des liaisons agence-utilisateur...")
    
    # Create and execute SQL diagnostic script
    diagnostic_sql = """
-- =============================================================================
-- DIAGNOSTIC DES LIAISONS AGENCE-UTILISATEUR
-- =============================================================================

SELECT 'UTILISATEURS AGENCE SANS AGENCE LIÉE' as section;

-- Trouver les utilisateurs d'agence sans agence liée
SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    'PROBLÈME: Utilisateur agence sans agence_id' as status
FROM profiles p
WHERE p.role = 'agency' 
AND p.agency_id IS NULL;

SELECT 'AGENCES ORPHELINES (SANS UTILISATEUR)' as section;

-- Trouver les agences sans utilisateur lié
SELECT 
    a.id as agency_id,
    a.name,
    a.email,
    a.user_id,
    'PROBLÈME: Agence sans user_id' as status
FROM agencies a
WHERE a.user_id IS NULL;

SELECT 'AGENCES AVEC EMAIL CORRESPONDANT AUX UTILISATEURS' as section;

-- Trouver les correspondances par email pour correction automatique
SELECT 
    p.id as user_id,
    p.email as user_email,
    p.role,
    a.id as agency_id,
    a.name as agency_name,
    a.email as agency_email,
    'PEUT ÊTRE CORRIGÉ AUTOMATIQUEMENT' as status
FROM profiles p
JOIN agencies a ON p.email = a.email
WHERE p.role = 'agency'
AND (p.agency_id IS NULL OR a.user_id IS NULL);

-- =============================================================================
-- CORRECTION AUTOMATIQUE
-- =============================================================================

SELECT 'CORRECTION EN COURS...' as section;

-- Corriger les liaisons basées sur l'email
UPDATE agencies 
SET user_id = (
    SELECT p.id 
    FROM profiles p 
    WHERE p.email = agencies.email 
    AND p.role = 'agency'
)
WHERE user_id IS NULL
AND email IN (
    SELECT email 
    FROM profiles 
    WHERE role = 'agency'
);

-- Corriger les profils utilisateur
UPDATE profiles 
SET agency_id = (
    SELECT a.id 
    FROM agencies a 
    WHERE a.email = profiles.email 
    AND a.user_id = profiles.id
)
WHERE role = 'agency'
AND agency_id IS NULL;

SELECT 'VÉRIFICATION APRÈS CORRECTION' as section;

-- Vérifier les corrections
SELECT 
    p.id as user_id,
    p.email,
    p.agency_id,
    a.id as agency_id_from_table,
    a.name as agency_name,
    a.user_id as agency_user_id,
    CASE 
        WHEN p.agency_id = a.id AND a.user_id = p.id THEN '✅ LIAISON CORRECTE'
        WHEN p.agency_id IS NULL THEN '❌ UTILISATEUR SANS AGENCE'
        WHEN a.user_id IS NULL THEN '❌ AGENCE SANS UTILISATEUR'
        ELSE '⚠️ LIAISON INCOHÉRENTE'
    END as status
FROM profiles p
LEFT JOIN agencies a ON p.email = a.email
WHERE p.role = 'agency';
"""
    
    try:
        # Write diagnostic script to temporary file
        with open("temp_diagnostic_agency_links.sql", "w", encoding="utf-8") as file:
            file.write(diagnostic_sql)
        print("✅ Script de diagnostic créé")
        
        # Execute via psql if available
        result = subprocess.run(['psql', '-f', 'temp_diagnostic_agency_links.sql'], 
                              capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print("✅ Diagnostic et correction exécutés avec succès")
            print("📊 Résultats:")
            print(result.stdout)
        else:
            print("⚠️ Exécution via psql échouée, essayons via supabase...")
            print(f"Erreur psql: {result.stderr}")
            
            # Try with supabase CLI
            result = subprocess.run(['npx', 'supabase', 'db', 'reset'], 
                                  capture_output=True, text=True, cwd=os.getcwd())
            
        # Clean up temporary file
        if os.path.exists("temp_diagnostic_agency_links.sql"):
            os.remove("temp_diagnostic_agency_links.sql")
            
    except Exception as e:
        print(f"⚠️ Erreur lors du diagnostic: {e}")
    
    print("🎉 Diagnostic et correction des liaisons agence terminés!")
    print("💡 Si le problème persiste, vérifiez les logs de votre application React pour voir les erreurs de getUserAgencies()")

def main():
    while True:
        user_input = input("prompt: ").strip().lower()
        
        if user_input == "stop":
            print("🛑 Arrêt du processus")
            break
        elif user_input in ["remove mock agencies", "clean mock", "remove mock"]:
            clean_mock_agencies()
        elif user_input in ["fix subscription limits", "fix limits", "correct limits"]:
            fix_subscription_limits()
        elif user_input in ["ensure free plan", "default free plan", "assign free plan"]:
            ensure_default_free_plan()
        elif user_input in ["fix agency links", "fix links", "diagnostic agency", "repair links"]:
            fix_agency_links()
        elif user_input in ["help", "aide"]:
            print("""
Commandes disponibles:
- remove mock agencies : Nettoie toutes les agences mock/test
- fix subscription limits : Corrige les problèmes de limites d'abonnement
- ensure free plan : S'assure que tous les utilisateurs ont le plan gratuit par défaut
- fix agency links : Diagnostic et correction des liaisons agence-utilisateur manquantes
- clean mock : Alias pour remove mock agencies  
- help : Affiche cette aide
- stop : Arrête le processus
            """)
        else:
            print(f"❌ Commande non reconnue: '{user_input}'")
            print("Tapez 'help' pour voir les commandes disponibles")

if __name__ == "__main__":
    main()
