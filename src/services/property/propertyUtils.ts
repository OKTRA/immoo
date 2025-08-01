
import { Property } from '@/assets/types';

// Format property data from database to frontend model
export const formatPropertyFromDb = (item: any): Property => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    location: item.location || item.address, // Handle both location and address fields
    address: item.address || item.location, // Add address field
    area: item.area || item.surface, // Handle both area and surface fields
    surface: item.surface || item.area, // Add surface field
    bedrooms: item.bedrooms || item.rooms, // Handle both bedrooms and rooms fields
    rooms: item.rooms || item.bedrooms, // Add rooms field
    bathrooms: item.bathrooms,
    price: item.price,
    charges: item.charges, // Add charges field
    status: item.status,
    imageUrl: item.image_url,
    virtualTourUrl: item.virtual_tour_url,
    features: item.features || [],
    petsAllowed: item.pets_allowed,
    furnished: item.furnished,
    yearBuilt: item.year_built,
    agencyFees: item.agency_fees,
    commissionRate: item.commission_rate,
    propertyCategory: item.property_category,
    paymentFrequency: item.payment_frequency,
    securityDeposit: item.security_deposit,
    agencyId: item.agency_id,
    ownerId: item.owner_id,
    livingRooms: item.living_rooms,
    kitchens: item.kitchens,
    shops: item.shops,
    createdAt: item.created_at, // Add creation date
    updatedAt: item.updated_at, // Add update date
    ownerInfo: item.owner ? {
      ownerId: item.owner.id,
      firstName: item.owner.first_name,
      lastName: item.owner.last_name,
      email: item.owner.email,
      phone: item.owner.phone
    } : undefined,
    // Add agency information if present
    agencyName: item.agency?.name,
    agencyLogo: item.agency?.logo_url,
    agencyPhone: item.agency?.phone,
    agencyEmail: item.agency?.email,
    agencyWebsite: item.agency?.website,
    agencyVerified: item.agency?.verified
  };
};

// Format property data from frontend model to database
export const formatPropertyToDb = (propertyData: any, ownerId: string | null = null, isUpdate: boolean = false) => {
  const dbData: Record<string, any> = {};
  
  // Only add fields that exist in the input data (important for partial updates)
  if (propertyData.title !== undefined || !isUpdate) dbData.title = propertyData.title;
  if (propertyData.description !== undefined) dbData.description = propertyData.description;
  if (propertyData.type !== undefined || !isUpdate) dbData.type = propertyData.type;
  if (propertyData.location !== undefined) dbData.location = propertyData.location;
  if (propertyData.area !== undefined || !isUpdate) dbData.area = propertyData.area;
  if (propertyData.surface !== undefined || !isUpdate) dbData.surface = propertyData.surface;
  if (propertyData.address !== undefined) dbData.address = propertyData.address;
  if (propertyData.charges !== undefined) dbData.charges = propertyData.charges;
  if (propertyData.rooms !== undefined || !isUpdate) dbData.rooms = propertyData.rooms;
  if (propertyData.bedrooms !== undefined || !isUpdate) dbData.bedrooms = propertyData.bedrooms || propertyData.rooms;
  if (propertyData.bathrooms !== undefined || !isUpdate) dbData.bathrooms = propertyData.bathrooms;
  if (propertyData.price !== undefined || !isUpdate) dbData.price = propertyData.price;
  if (propertyData.status !== undefined) dbData.status = propertyData.status;
  if (propertyData.imageUrl !== undefined) dbData.image_url = propertyData.imageUrl;
  if (propertyData.virtualTourUrl !== undefined) dbData.virtual_tour_url = propertyData.virtualTourUrl;
  if (propertyData.features !== undefined) dbData.features = propertyData.features;
  if (propertyData.petsAllowed !== undefined) dbData.pets_allowed = propertyData.petsAllowed;
  if (propertyData.furnished !== undefined) dbData.furnished = propertyData.furnished;
  if (propertyData.yearBuilt !== undefined) dbData.year_built = propertyData.yearBuilt;
  if (propertyData.agencyFees !== undefined) dbData.agency_fees = propertyData.agencyFees;
  if (propertyData.commissionRate !== undefined) dbData.commission_rate = propertyData.commissionRate;
  if (propertyData.propertyCategory !== undefined) dbData.property_category = propertyData.propertyCategory;
  if (propertyData.paymentFrequency !== undefined) dbData.payment_frequency = propertyData.paymentFrequency;
  if (propertyData.securityDeposit !== undefined) dbData.security_deposit = propertyData.securityDeposit;
  if (propertyData.livingRooms !== undefined) dbData.living_rooms = propertyData.livingRooms;
  if (propertyData.kitchens !== undefined) dbData.kitchens = propertyData.kitchens;
  if (propertyData.shops !== undefined) dbData.shops = propertyData.shops;
  
  // Add agency ID if provided
  if (propertyData.agencyId) {
    dbData.agency_id = propertyData.agencyId;
  }
  
  // Set owner_id if provided
  if (ownerId) {
    dbData.owner_id = ownerId;
  }
  
  return dbData;
};
