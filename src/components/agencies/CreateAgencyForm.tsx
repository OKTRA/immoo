
import { useState, useEffect } from "react";
import { createAgency } from "@/services/agency";
import { uploadAgencyLogo } from "@/services/agency/agencyMediaService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Agency } from "@/assets/types";
import { MapPin, Mail, Phone, Globe, Tag, Map, Building, Upload, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentUser } from "@/services/authService";
import { useResourceGuard } from '@/hooks/subscription/useResourceGuard';
import { useSubscriptionLimits } from '@/hooks/subscription/useSubscriptionLimits';

export default function CreateAgencyForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    specialties: "",
    serviceAreas: ""
  });
  const { canCreateResource } = useResourceGuard();
  const { limits: subscriptionLimits, isLoading: limitsLoading } = useSubscriptionLimits();
  const agencyLimitReached = !!subscriptionLimits && subscriptionLimits.agencies && !subscriptionLimits.agencies.allowed;
  const createDisabled = isSubmitting || (!subscriptionLimits ? true : agencyLimitReached);

  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Vérifier l'authentification avant de continuer
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error("Vous devez être connecté pour créer une agence");
        navigate('/auth'); // Rediriger vers la page d'authentification
        return;
      }

      // Vérifier la limite d'abonnement pour les agences
      const allowed = await canCreateResource('agencies', 'agence');
      if (!allowed) {
        return;
      }

      // Convert string specialties and serviceAreas to arrays
      const specialtiesArray = formData.specialties.split(',').map(item => item.trim()).filter(Boolean);
      const serviceAreasArray = formData.serviceAreas.split(',').map(item => item.trim()).filter(Boolean);

      // Create agency without logo first
      const placeholderLogoUrl = "https://placehold.co/400x400?text=Agency";
      
      const agencyData: Omit<Agency, 'id'> = {
        name: formData.name,
        logoUrl: placeholderLogoUrl,
        location: formData.location,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        specialties: specialtiesArray,
        serviceAreas: serviceAreasArray,
        properties: 0,
        rating: 0,
        verified: false
      };

      // Create the agency
      const { agency, error } = await createAgency(agencyData);

      if (error || !agency) {
        throw new Error(error || "Échec de la création de l'agence");
      }

      // If we have a logo file, upload it now that we have the agency ID
      if (logoFile && agency.id) {
        const { logoUrl, error: logoError } = await uploadAgencyLogo(agency.id, logoFile);
        
        if (logoError) {
          console.error("Erreur lors du téléchargement du logo, mais l'agence a été créée", logoError);
          toast.warning("Agence créée, mais le logo n'a pas pu être téléchargé");
        } else {
          toast.success("Agence créée avec succès avec logo");
        }
      } else {
        toast.success("Agence créée avec succès");
      }

      // Redirect to agency page or list
      navigate(`/agencies`);
    } catch (error: any) {
      console.error("Erreur lors de la création de l'agence:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated === false) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-primary text-white rounded-t-lg pb-6">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Nouvelle Agence Immobilière</CardTitle>
          </div>
          <CardDescription className="text-white/80 text-lg mt-1">
            Connexion requise
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentification requise</AlertTitle>
            <AlertDescription>
              Vous devez être connecté pour créer une agence immobilière.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button 
              className="mt-4" 
              onClick={() => navigate('/auth')}
            >
              Se connecter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated === null) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-primary text-white rounded-t-lg pb-6">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Nouvelle Agence Immobilière</CardTitle>
          </div>
          <CardDescription className="text-white/80 text-lg mt-1">
            Créez votre nouvelle agence en quelques clics
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
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-24 h-24 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50/60">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Aperçu du logo" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-2">
                      <Label htmlFor="logo" className="text-md mb-1 block">Logo de l'agence</Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="mt-1 bg-gray-50/60"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format recommandé : JPG ou PNG, carré, minimum 400x400px
                      </p>
                    </div>
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
              title={agencyLimitReached ? 'Limite de plan atteinte pour les agences' : (!subscriptionLimits ? 'Vérification de l\'abonnement en cours' : undefined)}
            >
              {isSubmitting ? 'Création en cours...' : 'Créer l\'agence'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
