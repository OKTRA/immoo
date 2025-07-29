import React, { useEffect, useState } from 'react';
import PropertyList from '@/components/properties/PropertyList';
import { getProperties } from '@/services/property/propertyQueries';
import { Property } from '@/assets/types';

export default function TestPropertyImages() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        console.log('🔍 Loading properties for image test...');
        const result = await getProperties(undefined, 10); // Get first 10 properties
        
        if (result.error) {
          setError(result.error);
          console.error('❌ Error loading properties:', result.error);
        } else {
          setProperties(result.properties);
          console.log('✅ Properties loaded:', result.properties.length);
          
          // Log image data for each property
          result.properties.forEach((property, index) => {
            console.log(`🏠 Property ${index + 1}: ${property.title}`);
            console.log(`   - imageUrl: ${property.imageUrl || 'None'}`);
            console.log(`   - images array:`, property.images);
            console.log(`   - images count: ${property.images?.length || 0}`);
          });
        }
      } catch (err: any) {
        setError(err.message);
        console.error('❌ Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des propriétés...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Erreur</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test des Images de Propriétés
          </h1>
          <p className="text-gray-600">
            Cette page teste l'affichage des images dans le composant PropertyList.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              📊 <strong>{properties.length}</strong> propriétés chargées
            </p>
            <p className="text-sm text-blue-800">
              📸 Propriétés avec images: <strong>
                {properties.filter(p => (p.images && p.images.length > 0) || p.imageUrl).length}
              </strong>
            </p>
            <p className="text-sm text-blue-800">
              🖼️ Propriétés avec imageUrl: <strong>
                {properties.filter(p => p.imageUrl).length}
              </strong>
            </p>
            <p className="text-sm text-blue-800">
              📷 Propriétés avec images array: <strong>
                {properties.filter(p => p.images && p.images.length > 0).length}
              </strong>
            </p>
          </div>
        </div>

        {properties.length > 0 ? (
          <PropertyList properties={properties} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune propriété trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
