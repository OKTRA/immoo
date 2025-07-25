# Script pour corriger la structure JSX dans HeroSection.tsx
$filePath = "c:\Users\lenovo\Desktop\oktra\immoo\src\components\HeroSection.tsx"
$content = Get-Content $filePath -Raw

# Remplacer la ligne problématique pour ajouter la balise div manquante
$content = $content -replace '(\s+</div>\s+</div>\s+\}\))', '$1`n                </div>`n               )}'

# Écrire le contenu corrigé
Set-Content $filePath $content -Encoding UTF8

Write-Host "Correction appliquée avec succès!"
