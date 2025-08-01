import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Upload, Camera, Save, Loader2, MapPin, Mail, Phone, Globe, CheckCircle } from "lucide-react";
import { useMobileToast } from '@/hooks/useMobileToast';
import { getAgencyById } from "@/services/agency";
import { updateAgency } from "@/services/agency/agencyManagementService";
import { uploadAgencyLogo } from "@/services/agency/agencyMediaService";
import { useTranslation } from "@/hooks/useTranslation";

interface AgencyFormData {
  name: string;
  location: string;
  description: string;
  email: string;
  phone: string;
  website: string;
}

export default function AgencySettingsPage() {
  const mobileToast = useMobileToast();
  const { agencyId } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLogoUploaded, setIsLogoUploaded] = useState(false);
  const [formData, setFormData] = useState<AgencyFormData>({
    name: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: ""
  });

  // Fetch agency data
  const { data: agencyData, isLoading: isLoadingAgency } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId
  });

  const agency = agencyData?.agency;

  // Update form data when agency data is loaded
  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || "",
        location: agency.location || "",
        description: agency.description || "",
        email: agency.email || "",
        phone: agency.phone || "",
        website: agency.website || ""
      });
      setLogoPreview(agency.logoUrl || null);
      setIsLogoUploaded(false);
    }
  }, [agency]);

  // Update agency mutation
  const updateAgencyMutation = useMutation({
    mutationFn: async (data: Partial<AgencyFormData>) => {
      if (!agencyId) throw new Error("Agency ID is required");
      return updateAgency(agencyId, data);
    },
    onSuccess: () => {
      toast.success("Informations mises à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ['agency', agencyId] });
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!agencyId) throw new Error("Agency ID is required");
      console.log('Starting logo upload for agency:', agencyId);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      const result = await uploadAgencyLogo(agencyId, file);
      console.log('Upload result:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (data) => {
      console.log('Logo upload successful:', data);
      if (data.logoUrl) {
        // Toast de téléchargement de logo désactivé sur mobile (non essentiel)
        mobileToast.success("Logo téléchargé et sauvegardé avec succès");
        setLogoPreview(data.logoUrl);
        setIsLogoUploaded(true);
        setLogoFile(null); // Clear the file input
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Force refresh of agency data to update header
        queryClient.invalidateQueries({ queryKey: ['agency', agencyId] });
        
        // Also update the local cache immediately
        queryClient.setQueryData(['agency', agencyId], (oldData: any) => {
          if (oldData?.agency) {
            return {
              ...oldData,
              agency: {
                ...oldData.agency,
                logoUrl: data.logoUrl
              }
            };
          }
          return oldData;
        });
      }
    },
    onError: (error: any) => {
      console.error('Logo upload error:', error);
      toast.error(`Erreur lors du téléchargement du logo: ${error.message}`);
      setIsLogoUploaded(false);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Taille maximale : 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner un fichier image valide");
        return;
      }
      
      setLogoFile(file);
      setIsLogoUploaded(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      console.log('Logo file selected:', { name: file.name, size: file.size, type: file.type });
    }
  };

  const handleLogoUpload = async () => {
    if (logoFile) {
      console.log('Initiating logo upload...');
      uploadLogoMutation.mutate(logoFile);
    }
  };

  const handleSaveChanges = async () => {
    updateAgencyMutation.mutate(formData);
  };

  if (isLoadingAgency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-pearl/50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-immoo-gold" />
          <span className="text-immoo-navy">Chargement des paramètres...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-pearl/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-immoo-navy mb-2">{t('agencyDashboard.pages.settings.title')}</h1>
          <p className="text-immoo-gray">{t('agencyDashboard.pages.settings.description')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm border-immoo-gray/20 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-immoo-navy flex items-center justify-center gap-2">
                  <Camera className="h-5 w-5" />
                  {t('agencyDashboard.pages.settings.agencyLogo')}
                </CardTitle>
                <CardDescription>
                  {t('agencyDashboard.pages.settings.logoDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Preview */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl border-3 border-immoo-gold/30 overflow-hidden bg-gradient-to-br from-immoo-pearl to-white shadow-lg">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo de l'agence" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Error loading logo preview:', e);
                            setLogoPreview(null);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20">
                          <Building2 className="h-12 w-12 text-immoo-gray" />
                        </div>
                      )}
                    </div>
                    {logoFile && !isLogoUploaded && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-immoo-gold rounded-full flex items-center justify-center">
                        <Upload className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {isLogoUploaded && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label htmlFor="logo-upload" className="text-sm font-medium text-immoo-navy">
                    {t('agencyDashboard.pages.settings.chooseNewLogo')}
                  </Label>
                  <Input
                    ref={fileInputRef}
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="border-immoo-gray/30 focus:border-immoo-gold"
                  />
                  <p className="text-xs text-immoo-gray">
                    {t('agencyDashboard.pages.settings.recommendedFormatSize')}
                  </p>
                  
                  {logoFile && !isLogoUploaded && (
                    <Button 
                      onClick={handleLogoUpload}
                      disabled={uploadLogoMutation.isPending}
                      className="w-full bg-gradient-to-r from-immoo-gold to-immoo-navy hover:from-immoo-gold/90 hover:to-immoo-navy/90 text-white"
                    >
                      {uploadLogoMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('agencyDashboard.pages.settings.uploadingInProgress')}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {t('agencyDashboard.pages.settings.uploadAndSaveLogo')}
                        </>
                      )}
                    </Button>
                  )}
                  
                  {isLogoUploaded && (
                    <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('agencyDashboard.pages.settings.logoUploadedSuccessfully')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm border-immoo-gray/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-immoo-navy flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('agencyDashboard.pages.settings.agencyInformation')}
                </CardTitle>
                <CardDescription>
                  {t('agencyDashboard.pages.settings.modifyGeneralInformation')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nom de l'agence */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-immoo-navy">
                    {t('agencyDashboard.pages.settings.agencyName')} *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('agencyDashboard.pages.settings.agencyNamePlaceholder')}
                    className="border-immoo-gray/30 focus:border-immoo-gold"
                    required
                  />
                </div>

                {/* Localisation */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-immoo-navy flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('agencyDashboard.pages.settings.address')}
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={t('agencyDashboard.pages.settings.agencyAddressPlaceholder')}
                    className="border-immoo-gray/30 focus:border-immoo-gold"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-immoo-navy flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('agencyDashboard.pages.settings.email')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('agencyDashboard.pages.settings.agencyEmailPlaceholder')}
                    className="border-immoo-gray/30 focus:border-immoo-gold"
                  />
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-immoo-navy flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t('agencyDashboard.pages.settings.phone')}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('agencyDashboard.pages.settings.agencyPhonePlaceholder')}
                    className="border-immoo-gray/30 focus:border-immoo-gold"
                  />
                </div>

                {/* Site web */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-immoo-navy flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('agencyDashboard.pages.settings.website')}
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder={t('agencyDashboard.pages.settings.agencyWebsitePlaceholder')}
                    className="border-immoo-gray/30 focus:border-immoo-gold"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-immoo-navy">
                    {t('agencyDashboard.pages.settings.description')}
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t('agencyDashboard.pages.settings.agencyDescriptionPlaceholder')}
                    rows={4}
                    className="border-immoo-gray/30 focus:border-immoo-gold resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-immoo-gray/20">
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={updateAgencyMutation.isPending}
                    className="bg-gradient-to-r from-immoo-gold to-immoo-navy hover:from-immoo-gold/90 hover:to-immoo-navy/90 text-white px-8"
                  >
                    {updateAgencyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('agencyDashboard.pages.settings.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('agencyDashboard.pages.settings.saveChanges')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
