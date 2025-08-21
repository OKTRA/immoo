import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Agency } from '@/assets/types';
import { getAgencyById, createAgency, updateAgency } from "@/services/agency";
import { MapPin, Mail, Phone, Globe, Tag, Map, Building } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useResourceGuard } from '@/hooks/subscription/useResourceGuard';
import { useSubscriptionLimits } from '@/hooks/subscription/useSubscriptionLimits';

// Pour l'erreur de type dans AgencyForm.tsx, nous devons typer correctement le résultat de la requête:
interface AgencyQueryResult {
  agency: Agency | null;
  error: string | null;
}

export default function AgencyForm() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    location: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    specialties: '',
    serviceAreas: '',
    properties: 0,
    rating: 0,
    verified: false,
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const isNewAgency = agencyId === 'new';
  const { canCreateResource } = useResourceGuard();
  const { limits: subscriptionLimits, isLoading: limitsLoading } = useSubscriptionLimits();
  const agencyLimitReached = !!subscriptionLimits && subscriptionLimits.agencies && !subscriptionLimits.agencies.allowed;
  const createDisabled = isSubmitting || (isNewAgency && (!subscriptionLimits ? true : agencyLimitReached));

  // Remplacer la partie qui utilise les données de l'agence avec la vérification de type:
  const { data, isLoading } = useQuery<AgencyQueryResult>({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId as string),
    enabled: !!agencyId && agencyId !== 'new',
  });

  useEffect(() => {
    // Charger les données de l'agence existante si on est en mode édition
    if (agencyId !== 'new' && !isLoading && data?.agency) {
      const agency = data.agency;
      setFormData({
        name: agency.name || '',
        logoUrl: agency.logoUrl || '',
        location: agency.location || '',
        description: agency.description || '',
        email: agency.email || '',
        phone: agency.phone || '',
        website: agency.website || '',
        specialties: agency.specialties ? agency.specialties.join(', ') : '',
        serviceAreas: agency.serviceAreas ? agency.serviceAreas.join(', ') : '',
        properties: agency.properties || 0,
        rating: agency.rating || 0,
        verified: agency.verified || false,
      });
    }

    // Mettre à jour le titre de la page
    document.title = isNewAgency ? "Créer une agence | Immobilier" : "Modifier une agence | Immobilier";
  }, [agencyId, isLoading, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pour le problème avec le type de la fonction createAgency:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { name, logoUrl, location, description, email, phone, website, specialties, serviceAreas, properties, rating, verified } = formData;

      // Convertir les chaînes de spécialités et zones de service en tableaux
      const specialtiesArray = specialties ? specialties.split(',').map(s => s.trim()).filter(Boolean) : [];
      const serviceAreasArray = serviceAreas ? serviceAreas.split(',').map(s => s.trim()).filter(Boolean) : [];

      const newAgencyData: Omit<Agency, 'id'> = {
        name,
        logoUrl,
        location,
        description,
        email,
        phone,
        website,
        specialties: specialtiesArray,
        serviceAreas: serviceAreasArray,
        properties: properties || 0,
        rating: rating || 0,
        verified: verified || false,
      };
      
      if (isNewAgency) {
        // Check plan limit before creating a new agency
        const allowed = await canCreateResource('agencies', 'agence');
        if (!allowed) {
          return;
        }
        const agencyResult = await createAgency(newAgencyData);
        if (agencyResult.error) {
          throw new Error(agencyResult.error);
        }
        toast.success('Agence créée avec succès!');
        navigate('/agencies');
      } else {
        const agencyResult = await updateAgency(agencyId as string, newAgencyData);
        if (agencyResult.error) {
          throw new Error(agencyResult.error);
        }
        toast.success('Agence mise à jour avec succès!');
        navigate('/agencies');
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-primary text-white rounded-t-lg pb-6">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">{isNewAgency ? 'Créer une agence' : 'Modifier une agence'}</CardTitle>
          </div>
          <CardDescription className="text-white/80 text-lg mt-1">
            {isNewAgency ? 'Ajoutez une nouvelle agence immobilière' : 'Modifiez les informations de votre agence'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Informations générales */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">Informations générales</h3>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-md mb-1.5 block">Nom de l'agence *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nom de l'agence"
                      required
                      className="bg-gray-50/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="logoUrl" className="text-md mb-1.5 block">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      placeholder="URL du logo de l'agence"
                      className="bg-gray-50/60"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-md mb-1.5 block">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Description détaillée de l'agence et de ses services"
                      className="flex w-full rounded-md border border-input bg-gray-50/60 px-3 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">Coordonnées</h3>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label htmlFor="location" className="text-md">Adresse *</Label>
                    </div>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Adresse complète de l'agence"
                      required
                      className="mt-1.5 bg-gray-50/60"
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <Label htmlFor="email" className="text-md">Email</Label>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email de contact professionnel"
                      className="mt-1.5 bg-gray-50/60"
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <Label htmlFor="phone" className="text-md">Téléphone</Label>
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Numéro de téléphone professionnel"
                      className="mt-1.5 bg-gray-50/60"
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <Label htmlFor="website" className="text-md">Site web</Label>
                    </div>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Site web de l'agence (avec https://)"
                      className="mt-1.5 bg-gray-50/60"
                    />
                  </div>
                </div>
              </div>

              {/* Spécialités et zones */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">Spécialités et zones</h3>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <Label htmlFor="specialties" className="text-md">Spécialités</Label>
                    </div>
                    <Input
                      id="specialties"
                      name="specialties"
                      value={formData.specialties}
                      onChange={handleChange}
                      placeholder="Résidentiel, Commercial, Investissement, Luxe..."
                      className="mt-1.5 bg-gray-50/60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Séparez les spécialités par des virgules
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Map className="h-4 w-4 text-primary" />
                      <Label htmlFor="serviceAreas" className="text-md">Zones de service</Label>
                    </div>
                    <Input
                      id="serviceAreas"
                      name="serviceAreas"
                      value={formData.serviceAreas}
                      onChange={handleChange}
                      placeholder="Paris, Boulogne, Neuilly..."
                      className="mt-1.5 bg-gray-50/60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Séparez les zones par des virgules
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50/80 px-6 py-4 flex justify-end space-x-4 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/agencies')}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createDisabled}
              className="bg-primary text-white hover:bg-primary/90 min-w-32"
              title={isNewAgency && agencyLimitReached ? 'Limite de plan atteinte pour les agences' : (isNewAgency && !subscriptionLimits ? 'Vérification de l\'abonnement en cours' : undefined)}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
