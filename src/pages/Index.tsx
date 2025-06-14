
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function IndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Bienvenue sur ImmoConnect</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Découvrez nos Agences</CardTitle>
              <CardDescription>Explorez les meilleures agences immobilières vérifiées</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Trouvez l'agence qui correspond à vos besoins parmi nos partenaires de confiance.</p>
              <Button onClick={() => navigate('/agencies')}>Voir les agences</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Trouvez votre bien idéal</CardTitle>
              <CardDescription>Parcourez notre sélection de propriétés</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Maisons, appartements, terrains... Trouvez votre bonheur.</p>
              <Button onClick={() => navigate('/search')}>Rechercher une propriété</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Espace Propriétaire</CardTitle>
              <CardDescription>Gérez vos biens immobiliers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Accédez à votre espace propriétaire pour gérer vos biens.</p>
              <Button onClick={() => navigate('/owner')}>Accéder à l'espace propriétaire</Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Tableau de bord</CardTitle>
            <CardDescription>Aperçu de vos activités</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Fonctionnalité en cours de développement</p>
              <p>Le tableau de bord sera bientôt disponible</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
