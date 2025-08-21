import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { RoleGuard } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Mail, 
  Shield, 
  Globe,
  Bell,
  Palette
} from 'lucide-react';

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  is_editable: boolean;
  updated_at: string;
}

const SystemConfiguration: React.FC = () => {
  const { profile } = useAuth();
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingConfigs, setEditingConfigs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSystemConfigs();
  }, []);

  const fetchSystemConfigs = async () => {
    try {
      setLoading(true);
      // Simuler la récupération des configurations système
      const mockConfigs: SystemConfig[] = [
        {
          id: '1',
          key: 'app_name',
          value: 'IMMOO',
          description: 'Nom de l\'application',
          category: 'Général',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          key: 'maintenance_mode',
          value: 'false',
          description: 'Mode maintenance',
          category: 'Système',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          key: 'max_file_size',
          value: '10485760',
          description: 'Taille maximale des fichiers (en bytes)',
          category: 'Système',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          key: 'smtp_host',
          value: 'smtp.gmail.com',
          description: 'Serveur SMTP',
          category: 'Email',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          key: 'smtp_port',
          value: '587',
          description: 'Port SMTP',
          category: 'Email',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '6',
          key: 'default_language',
          value: 'fr',
          description: 'Langue par défaut',
          category: 'Localisation',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '7',
          key: 'timezone',
          value: 'Europe/Paris',
          description: 'Fuseau horaire par défaut',
          category: 'Localisation',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '8',
          key: 'session_timeout',
          value: '3600',
          description: 'Délai d\'expiration de session (en secondes)',
          category: 'Sécurité',
          is_editable: true,
          updated_at: new Date().toISOString()
        },
        {
          id: '9',
          key: 'max_login_attempts',
          value: '5',
          description: 'Nombre maximum de tentatives de connexion',
          category: 'Sécurité',
          is_editable: true,
          updated_at: new Date().toISOString()
        }
      ];
      
      setConfigs(mockConfigs);
    } catch (error) {
      toast.error('Erreur lors du chargement des configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (configKey: string, value: string) => {
    setEditingConfigs(prev => ({
      ...prev,
      [configKey]: value
    }));
  };

  const saveConfig = async (configKey: string) => {
    try {
      setSaving(true);
      
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour la configuration locale
      setConfigs(prev => prev.map(config => 
        config.key === configKey 
          ? { ...config, value: editingConfigs[configKey], updated_at: new Date().toISOString() }
          : config
      ));
      
      // Nettoyer l'édition
      setEditingConfigs(prev => {
        const newState = { ...prev };
        delete newState[configKey];
        return newState;
      });
      
      toast.success('Configuration sauvegardée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Général': <Settings className="w-4 h-4" />,
      'Système': <Database className="w-4 h-4" />,
      'Email': <Mail className="w-4 h-4" />,
      'Sécurité': <Shield className="w-4 h-4" />,
      'Localisation': <Globe className="w-4 h-4" />,
      'Notifications': <Bell className="w-4 h-4" />,
      'Apparence': <Palette className="w-4 h-4" />
    };
    return iconMap[category] || <Settings className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Général': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Système': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Email': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Sécurité': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Localisation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Notifications': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Apparence': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const renderConfigValue = (config: SystemConfig) => {
    const isEditing = editingConfigs.hasOwnProperty(config.key);
    const currentValue = isEditing ? editingConfigs[config.key] : config.value;

    if (config.key === 'maintenance_mode') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentValue === 'true'}
            onCheckedChange={(checked) => handleConfigChange(config.key, checked.toString())}
            disabled={!config.is_editable}
          />
          <span className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
            {currentValue === 'true' ? 'Activé' : 'Désactivé'}
          </span>
        </div>
      );
    }

    if (config.key === 'default_language') {
      return (
        <Select
          value={currentValue}
          onValueChange={(value) => handleConfigChange(config.key, value)}
          disabled={!config.is_editable}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (config.key === 'timezone') {
      return (
        <Select
          value={currentValue}
          onValueChange={(value) => handleConfigChange(config.key, value)}
          disabled={!config.is_editable}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
            <SelectItem value="Europe/London">Europe/London</SelectItem>
            <SelectItem value="America/New_York">America/New_York</SelectItem>
            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        value={currentValue}
        onChange={(e) => handleConfigChange(config.key, e.target.value)}
        disabled={!config.is_editable}
        className="w-full"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Chargement des configurations..." />
      </div>
    );
  }

  return (
    <RoleGuard requiredPermission="system_settings">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-immoo-navy dark:text-immoo-pearl">
              Configuration Système
            </h1>
            <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 mt-2">
              Gérez les paramètres globaux de l'application
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchSystemConfigs} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Groupes de configurations par catégorie */}
        {Object.entries(
          configs.reduce((acc, config) => {
            if (!acc[config.category]) acc[config.category] = [];
            acc[config.category].push(config);
            return acc;
          }, {} as { [category: string]: SystemConfig[] })
        ).map(([category, categoryConfigs]) => (
          <Card key={category} className="mb-6 border-immoo-gold/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-immoo-navy dark:text-immoo-pearl">
                {getCategoryIcon(category)}
                {category}
                <span className="text-sm font-normal text-immoo-navy/50 dark:text-immoo-pearl/50">
                  ({categoryConfigs.length} paramètres)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryConfigs.map((config) => (
                <div key={config.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border border-immoo-gold/10 rounded-lg">
                  <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-immoo-navy dark:text-immoo-pearl">
                        {config.key}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(category)}`}>
                        {config.category}
                      </span>
                    </div>
                    <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                      {config.description}
                    </p>
                  </div>
                  
                  <div className="md:col-span-1">
                    {renderConfigValue(config)}
                  </div>
                  
                  <div className="md:col-span-1 flex justify-end">
                    {editingConfigs.hasOwnProperty(config.key) ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveConfig(config.key)}
                          disabled={saving}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingConfigs(prev => {
                              const newState = { ...prev };
                              delete newState[config.key];
                              return newState;
                            });
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-immoo-navy/50 dark:text-immoo-pearl/50">
                        Modifié le {new Date(config.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {configs.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-immoo-navy/30 mx-auto mb-4" />
            <p className="text-immoo-navy/60 dark:text-immoo-pearl/60">
              Aucune configuration trouvée
            </p>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default SystemConfiguration;
