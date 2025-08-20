
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getCurrentUser, signOut } from '@/services/authService';
import { updateUserProfile, uploadProfileAvatar } from '@/services/profileService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        
        if (!currentUser) {
          navigate('/auth?redirectTo=/profile');
          return;
        }
        
        setUser(currentUser);
        
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
          setFormData({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || currentUser.email || '',
          });
          
          if (profileData.avatar_url) {
            setAvatarPreview(profileData.avatar_url);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, [navigate]);

  // Écouter l'événement de déconnexion pour redirection automatique
  useEffect(() => {
    const handleAuthStateChange = (event: CustomEvent) => {
      if (event.detail.type === 'signout' && event.detail.shouldRedirect) {
        navigate('/');
      }
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) return;

    setIsSubmitting(true);
    try {
      // Update profile data
      await updateUserProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Upload avatar if selected
      if (avatarFile && user.id) {
        await uploadProfileAvatar(user.id, avatarFile);
      }

      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    // La redirection sera gérée par l'événement auth-state-changed
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles et vos préférences</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {avatarPreview || profile?.avatar_url ? (
                          <img 
                            src={avatarPreview || profile?.avatar_url} 
                            alt="Avatar" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl text-muted-foreground">
                            {profile?.first_name?.charAt(0) || ''}{profile?.last_name?.charAt(0) || ''}
                          </span>
                        )}
                      </div>
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                          <path d="M9 14l2 2 4-4"></path>
                        </svg>
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">Prénom</label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">Nom</label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Mise à jour..." : "Enregistrer les modifications"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="security">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Changer de mot de passe</h3>
                  <p className="text-sm text-muted-foreground">
                    Pour changer votre mot de passe, utilisez le lien de réinitialisation qui vous sera envoyé par email.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Fonctionnalité à venir", { description: "La réinitialisation de mot de passe sera bientôt disponible" })}
                  >
                    Réinitialiser le mot de passe
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => navigate('/')}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Se déconnecter
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>
  );
}
