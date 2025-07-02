
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getPropertyById, getPropertyByIdForEdit } from "@/services/property";

export default function usePropertyData(propertyId: string | undefined) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "apartment",
    location: "",
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    kitchens: 0,
    shops: 0,
    livingRooms: 0,
    price: 0,
    status: "available",
    features: [],
    petsAllowed: false,
    furnished: false,
    paymentFrequency: "monthly",
    securityDeposit: 0,
    yearBuilt: "",
    agencyFees: 0,
    commissionRate: 0,
    propertyCategory: "residence",
    imageUrl: "",
    virtualTourUrl: "",
    images: [],
    additionalImages: [],
    ownerInfo: {
      ownerId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });

  // Is this edit mode?
  const isEditMode = !!propertyId;
  
  // Fetch property data in edit mode
  const { data: propertyData, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyByIdForEdit(propertyId || ''),
    enabled: isEditMode,
    meta: {
      onSettled: (data, error) => {
        if (data?.property) {
          console.log("Property data loaded:", data.property);
          const property = data.property;
          
          // Map all property data to form data structure
          setFormData(prevData => ({
            ...prevData,
            // Basic info
            title: property.title || "",
            description: property.description || "",
            type: property.type || "apartment",
            location: property.location || "",
            propertyCategory: property.propertyCategory || "residence",
            
            // Numeric fields
            area: property.area || 0,
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            kitchens: property.kitchens || 0,
            shops: property.shops || 0,
            livingRooms: property.livingRooms || 0,
            price: property.price || 0,
            securityDeposit: property.securityDeposit || 0,
            agencyFees: property.agencyFees || 0,
            commissionRate: property.commissionRate || 0,
            
            // Other fields
            status: property.status || "available",
            features: property.features || [],
            petsAllowed: property.petsAllowed || false,
            furnished: property.furnished || false,
            paymentFrequency: property.paymentFrequency || "monthly",
            yearBuilt: property.yearBuilt || "",
            
            // Media
            imageUrl: property.imageUrl || "",
            virtualTourUrl: property.virtualTourUrl || "",
            images: property.images || [],
            additionalImages: property.additionalImages || [],
            
            // Owner info
            ownerInfo: property.ownerInfo || {
              ownerId: property.ownerId || "",
              firstName: "",
              lastName: "",
              email: "",
              phone: ""
            }
          }));
        }
        if (error) {
          toast.error("Impossible de charger les données de la propriété");
          console.error("Error fetching property:", error);
        }
      }
    }
  });

  return {
    formData,
    setFormData,
    isLoading,
    isEditMode
  };
}
