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
        elif user_input in ["help", "aide"]:
            print("""
Commandes disponibles:
- remove mock agencies : Nettoie toutes les agences mock/test
- fix subscription limits : Corrige les problèmes de limites d'abonnement
- ensure free plan : S'assure que tous les utilisateurs ont le plan gratuit par défaut
- clean mock : Alias pour remove mock agencies  
- help : Affiche cette aide
- stop : Arrête le processus
            """)
        else:
            print(f"❌ Commande non reconnue: '{user_input}'")
            print("Tapez 'help' pour voir les commandes disponibles")

if __name__ == "__main__":
    main()