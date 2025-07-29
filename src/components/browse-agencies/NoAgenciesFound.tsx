import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Plus, Search, MapPin, Star, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface NoAgenciesFoundProps {
  searchTerm: string;
  user: any;
  canCreateAgency: boolean;
}

export const NoAgenciesFound: React.FC<NoAgenciesFoundProps> = ({ searchTerm, user, canCreateAgency }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16">
      {/* Main Empty State */}
      <div className="max-w-md mx-auto mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-12 w-12 text-immoo-gold" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {searchTerm ? t('browseAgencies.noResults.title') : t('browseAgencies.noResults.noAgencies')}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {searchTerm 
            ? `${t('browseAgencies.noResults.searchDescription')} "${searchTerm}". Essayez avec d'autres mots-clés.`
            : t('browseAgencies.noResults.noAgenciesDescription')
          }
        </p>
      </div>

      {/* Suggestions */}
      {searchTerm && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('browseAgencies.noResults.suggestions')}</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {['Bamako', 'Vente', 'Location', 'Appartement', 'Villa'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="bg-white/80 border-gray-200 hover:bg-immoo-gold hover:text-white hover:border-immoo-gold transition-all duration-300"
              >
                <Search className="h-3 w-3 mr-2" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Create Agency CTA */}
      {user && canCreateAgency && (
        <div className="max-w-lg mx-auto">
          <Card className="bg-gradient-to-br from-immoo-gold/10 via-white to-immoo-navy/10 border-immoo-gold/20 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-immoo-gold to-immoo-navy rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                
                <h4 className="text-xl font-bold text-immoo-navy mb-2">
                  {t('browseAgencies.noResults.createAgency.title')}
                </h4>
                
                <p className="text-gray-600 mb-6">
                  {t('browseAgencies.noResults.createAgency.description')}
                </p>
                
                <Button 
                  asChild
                  className="bg-immoo-gold hover:bg-immoo-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
                >
                  <Link to="/create-agency" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('browseAgencies.noResults.createAgency.button')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Preview */}
      {!user && (
        <div className="mt-12 max-w-4xl mx-auto">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">
            {t('browseAgencies.noResults.features.title')}
          </h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
              <MapPin className="h-8 w-8 text-immoo-gold mx-auto mb-3" />
              <h5 className="font-semibold text-gray-900 mb-2">{t('browseAgencies.noResults.features.location.title')}</h5>
              <p className="text-sm text-gray-600">{t('browseAgencies.noResults.features.location.description')}</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
              <Star className="h-8 w-8 text-immoo-gold mx-auto mb-3" />
              <h5 className="font-semibold text-gray-900 mb-2">{t('browseAgencies.noResults.features.quality.title')}</h5>
              <p className="text-sm text-gray-600">{t('browseAgencies.noResults.features.quality.description')}</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
              <Users className="h-8 w-8 text-immoo-gold mx-auto mb-3" />
              <h5 className="font-semibold text-gray-900 mb-2">{t('browseAgencies.noResults.features.expertise.title')}</h5>
              <p className="text-sm text-gray-600">{t('browseAgencies.noResults.features.expertise.description')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
