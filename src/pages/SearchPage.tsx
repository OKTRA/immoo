
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuler une recherche
    setTimeout(() => {
      setIsLoading(false);
      // Ici, vous ajouteriez la logique de recherche réelle
    }, 1000);
  };

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Recherche de propriétés</h1>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Rechercher par adresse, ville, code postal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Type de bien</option>
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="commercial">Local commercial</option>
                  </select>
                  
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Prix</option>
                    <option value="0-500">0€ - 500€</option>
                    <option value="500-1000">500€ - 1 000€</option>
                    <option value="1000-1500">1 000€ - 1 500€</option>
                    <option value="1500+">1 500€ +</option>
                  </select>
                  
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Surface</option>
                    <option value="0-50">0 - 50 m²</option>
                    <option value="50-100">50 - 100 m²</option>
                    <option value="100-150">100 - 150 m²</option>
                    <option value="150+">150 m² +</option>
                  </select>
                  
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Nombre de pièces</option>
                    <option value="1">1 pièce</option>
                    <option value="2">2 pièces</option>
                    <option value="3">3 pièces</option>
                    <option value="4+">4 pièces et +</option>
                  </select>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Recherche en cours..." : "Rechercher"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center py-8">
            <p className="text-muted-foreground">Utilisez les filtres ci-dessus pour trouver des propriétés</p>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
