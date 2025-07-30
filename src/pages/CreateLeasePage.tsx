import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/services/property";
import { getTenantById, getTenantsByAgencyId } from "@/services/tenant/tenantService";
import { getPropertiesByAgencyId } from "@/services/property";
import { Property, ApartmentLease, Tenant } from "@/assets/types";
import { ArrowLeft, ArrowRight, BadgeCheck, User, Search, Home } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LeaseDetailsForm from "@/components/leases/LeaseDetailsForm";
import { createLease } from "@/services/tenant/leaseService";
import { useTranslation } from "@/hooks/useTranslation";

interface LeaseFormData {
  propertyId?: string;
  apartmentId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  paymentStartDate?: string;
  monthly_rent?: number;
  security_deposit?: number;
  payment_day?: number;
  is_active?: boolean;
  signed_by_tenant?: boolean;
  signed_by_owner?: boolean;
  has_renewal_option?: boolean;
  lease_type?: string;
  special_conditions?: string;
  status?: string;
  payment_frequency?: string;
}

export default function CreateLeasePage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const queryParams = new URLSearchParams(location.search);
  const tenantId = queryParams.get('tenantId');
  const quickAssign = queryParams.get('quickAssign') === 'true';
  
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  
  const defaultStartDate = today.toISOString().split('T')[0];
  const defaultEndDate = nextYear.toISOString().split('T')[0];
  
  const [property, setProperty] = useState<Property | null>(null);
  const [tenant, setTenant] = useState<Partial<Tenant> | null>(null);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(propertyId || undefined);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(tenantId || undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaseData, setLeaseData] = useState<LeaseFormData>({
    propertyId: selectedPropertyId,
    tenantId: selectedTenantId,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    paymentStartDate: defaultStartDate,
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!agencyId) return;

    const fetchAgencyData = async () => {
      try {
        setLoading(true);
        
        const { properties: allProperties, error: propertiesError } = await getPropertiesByAgencyId(agencyId);
        if (propertiesError) throw new Error(propertiesError);
        
        const availablePropertiesOnly = allProperties?.filter(p => p.status === "available") || [];
        setAvailableProperties(availablePropertiesOnly);
        
        const { tenants: agencyTenants, error: tenantsError } = await getTenantsByAgencyId(agencyId);
        if (tenantsError) throw new Error(tenantsError);
        setAvailableTenants(agencyTenants || []);
        
      } catch (error: any) {
        toast({
          title: t('agencyDashboard.pages.createLease.error'),
          description: `${t('agencyDashboard.pages.createLease.cannotRetrieveAgencyData')}: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgencyData();
  }, [agencyId, toast, t]);

  useEffect(() => {
    const fetchSelectedEntities = async () => {
      if (!selectedPropertyId && !selectedTenantId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        if (selectedPropertyId && selectedPropertyId !== 'undefined') {
          const { property: selectedProperty, error: propertyError } = await getPropertyById(selectedPropertyId);
          if (propertyError) throw new Error(propertyError);
          
          if (selectedProperty && selectedProperty.status !== "available") {
            toast({
              title: t('agencyDashboard.pages.createLease.propertyNotAvailable'),
              description: `${t('agencyDashboard.pages.createLease.propertyNotAvailableDescription')} ${selectedProperty.status}).`,
              variant: "destructive"
            });
            setSelectedPropertyId(undefined);
            setProperty(null);
          } else {
            setProperty(selectedProperty);
            
            if (selectedProperty) {
              setLeaseData(prev => ({
                ...prev,
                propertyId: selectedPropertyId,
                monthly_rent: selectedProperty.price,
                security_deposit: selectedProperty.securityDeposit || selectedProperty.price,
                payment_frequency: selectedProperty.paymentFrequency || 'monthly',
                lease_type: selectedProperty.propertyCategory || "residence",
              }));
            }
          }
        }
        
        if (selectedTenantId && selectedTenantId !== 'undefined') {
          const { tenant: selectedTenant, error: tenantError } = await getTenantById(selectedTenantId);
          if (tenantError) throw new Error(tenantError);
          setTenant(selectedTenant);
          
          setLeaseData(prev => ({
            ...prev,
            tenantId: selectedTenantId
          }));
        }
        
        if (quickAssign && property) {
          const threeMonthsLater = new Date(today);
          threeMonthsLater.setMonth(today.getMonth() + 3);
          
          setLeaseData(prev => ({
            ...prev,
            startDate: defaultStartDate,
            endDate: threeMonthsLater.toISOString().split('T')[0],
            paymentStartDate: defaultStartDate,
            status: "active",
            is_active: true,
          }));
        }
      } catch (error: any) {
        toast({
          title: t('agencyDashboard.pages.createLease.error'),
          description: `${t('agencyDashboard.pages.createLease.cannotRetrieveData')}: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedEntities();
  }, [selectedPropertyId, selectedTenantId, quickAssign, toast, t]);

  const filteredProperties = availableProperties.filter(prop => 
    prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTenants = availableTenants.filter(tenant => 
    `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLeaseDataChange = (data: Partial<LeaseFormData>) => {
    setLeaseData(prev => ({ ...prev, ...data }));
  };

  const handlePropertyChange = async (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };

  const handleTenantChange = async (tenantId: string) => {
    setSelectedTenantId(tenantId);
  };

  const handleSkip = () => {
    const targetPropertyId = (propertyId && propertyId !== 'undefined') ? propertyId : selectedPropertyId;
    if (!targetPropertyId) {
      toast({
        title: t('agencyDashboard.pages.createLease.error'),
        description: t('agencyDashboard.pages.createLease.noPropertySelectedForNavigation'),
        variant: "destructive"
      });
      return;
    }
    navigate(`/agencies/${agencyId}/properties/${targetPropertyId}/tenants`);
  };

  const handleSubmit = async () => {
    if ((!selectedPropertyId || selectedPropertyId === 'undefined') && 
        (!propertyId || propertyId === 'undefined')) {
      toast({
        title: t('agencyDashboard.pages.createLease.error'),
        description: t('agencyDashboard.pages.createLease.pleaseSelectProperty'),
        variant: "destructive"
      });
      return;
    }
    
    if ((!selectedTenantId || selectedTenantId === 'undefined') && 
        (!tenantId || tenantId === 'undefined')) {
      toast({
        title: t('agencyDashboard.pages.createLease.error'),
        description: t('agencyDashboard.pages.createLease.pleaseSelectTenant'),
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const finalPropertyId = selectedPropertyId && selectedPropertyId !== 'undefined' ? 
                            selectedPropertyId : 
                            (propertyId && propertyId !== 'undefined' ? propertyId : '');
                            
      const finalTenantId = selectedTenantId && selectedTenantId !== 'undefined' ? 
                          selectedTenantId : 
                          (tenantId && tenantId !== 'undefined' ? tenantId : '');
      
      if (!finalPropertyId) {
        throw new Error(t('agencyDashboard.pages.createLease.propertyNotFoundOrInvalid'));
      }
      
      if (!finalTenantId) {
        throw new Error(t('agencyDashboard.pages.createLease.tenantNotFoundOrInvalid'));
      }
      
      const finalProperty = property || availableProperties.find(p => p.id === finalPropertyId);
      
      if (!finalProperty) {
        throw new Error(t('agencyDashboard.pages.createLease.propertyNotFound'));
      }
      
      const { property: currentProperty, error: propertyError } = await getPropertyById(finalPropertyId);
      
      if (propertyError) {
        throw new Error(`${t('agencyDashboard.pages.createLease.errorCheckingProperty')}: ${propertyError}`);
      }
      
      if (currentProperty && currentProperty.status !== "available") {
        throw new Error(`${t('agencyDashboard.pages.createLease.propertyNoLongerAvailable')} ${currentProperty.status})`);
      }
      
      const completeLeaseData: any = {
        ...leaseData,
        propertyId: finalPropertyId,
        apartmentId: finalPropertyId,
        tenantId: finalTenantId,
        startDate: leaseData.startDate || defaultStartDate,
        endDate: leaseData.endDate || defaultEndDate,
        paymentStartDate: leaseData.paymentStartDate || leaseData.startDate,
        payment_frequency: leaseData.payment_frequency || finalProperty.paymentFrequency || "monthly",
        monthly_rent: leaseData.monthly_rent || finalProperty.price || 0,
        security_deposit: leaseData.security_deposit || finalProperty.securityDeposit || finalProperty.price || 0,
        is_active: true,
        payment_day: leaseData.payment_day || 1,
        signed_by_tenant: true,
        signed_by_owner: true,
        has_renewal_option: leaseData.has_renewal_option || false,
        lease_type: finalProperty.propertyCategory || "residence",
        special_conditions: leaseData.special_conditions || "",
        status: "active"
      };
      
      console.log('Submitting lease data:', completeLeaseData);
      
      const { lease, error } = await createLease(completeLeaseData);
      if (error) throw new Error(error);
      
      toast({
        title: t('agencyDashboard.pages.createLease.tenantAssignedSuccessfully'),
        description: t('agencyDashboard.pages.createLease.redirectingToTenantManagement')
      });
      
      setTimeout(() => {
        navigate(`/agencies/${agencyId}/properties/${finalPropertyId}/tenants`);
      }, 1500);
    } catch (error: any) {
      toast({
        title: t('agencyDashboard.pages.createLease.errorAssigningTenant'),
        description: error.message,
        variant: "destructive"
      });
      console.error('Error submitting lease:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('agencyDashboard.pages.createLease.loading')}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const noAvailableProperties = availableProperties.length === 0;

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {quickAssign ? t('agencyDashboard.pages.createLease.quickAssignmentToProperty') : t('agencyDashboard.pages.createLease.leaseConfiguration')}
              </CardTitle>
              <CardDescription>
                {quickAssign 
                  ? t('agencyDashboard.pages.createLease.tenantAssignmentToProperty') 
                  : t('agencyDashboard.pages.createLease.defineLeaseTerms')}
              </CardDescription>
            </div>
            <div className="rounded-full bg-blue-100 p-2 text-blue-700">
              <BadgeCheck className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {noAvailableProperties && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-800 font-medium">{t('agencyDashboard.pages.createLease.noAvailableProperties')}</p>
              <p className="text-yellow-700 text-sm mt-1">
                {t('agencyDashboard.pages.createLease.allPropertiesOccupied')}
              </p>
            </div>
          )}
        
          {(!propertyId || !tenantId) && (
            <div className="space-y-6 mb-8">
              <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-muted-foreground mr-2" />
                  <Input
                    placeholder={t('agencyDashboard.pages.createLease.searchPropertyOrTenant')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white"
                  />
                </div>
                
                {(!propertyId || propertyId === 'undefined') && (
                  <div className="space-y-2">
                    <Label htmlFor="propertySelect">{t('agencyDashboard.pages.createLease.selectProperty')}</Label>
                    <Select
                      value={selectedPropertyId}
                      onValueChange={handlePropertyChange}
                      disabled={noAvailableProperties}
                    >
                      <SelectTrigger id="propertySelect">
                        <SelectValue placeholder={noAvailableProperties ? t('agencyDashboard.pages.createLease.noPropertiesAvailable') : t('agencyDashboard.pages.createLease.chooseProperty')} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProperties.map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.title} - {prop.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {(!tenantId || tenantId === 'undefined') && (
                  <div className="space-y-2">
                    <Label htmlFor="tenantSelect">{t('agencyDashboard.pages.createLease.selectTenant')}</Label>
                    <Select
                      value={selectedTenantId}
                      onValueChange={handleTenantChange}
                    >
                      <SelectTrigger id="tenantSelect">
                        <SelectValue placeholder={t('agencyDashboard.pages.createLease.chooseTenant')} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id || ''}>
                            {tenant.firstName} {tenant.lastName} - {tenant.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-6 space-y-4">
            {tenant && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-md">
                {tenant.photoUrl ? (
                  <img
                    src={tenant.photoUrl}
                    alt={`${tenant.firstName} ${tenant.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {tenant.firstName} {tenant.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{tenant.email}</p>
                </div>
              </div>
            )}
            
            {property && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-md">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{property.title}</p>
                  <p className="text-sm text-muted-foreground">{property.location}</p>
                </div>
              </div>
            )}
          </div>

          {property && tenant ? (
            <LeaseDetailsForm
              property={property}
              initialData={leaseData}
              onUpdate={handleLeaseDataChange}
              quickAssign={quickAssign}
            />
          ) : (
            <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-md">
              {t('agencyDashboard.pages.createLease.pleaseSelectPropertyAndTenant')}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => {
              const targetPropertyId = selectedPropertyId || propertyId;
              if (targetPropertyId && targetPropertyId !== 'undefined') {
                navigate(`/agencies/${agencyId}/properties/${targetPropertyId}/tenants`);
              } else {
                navigate(`/agencies/${agencyId}`);
              }
            }}
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('agencyDashboard.pages.createLease.back')}
          </Button>
          <div className="flex gap-2">
            {!quickAssign && (
              <Button 
                variant="outline" 
                onClick={handleSkip}
                disabled={submitting}
              >
                {t('agencyDashboard.pages.createLease.skipThisStep')}
              </Button>
            )}
            <Button 
              onClick={handleSubmit}
              disabled={submitting || !property || !tenant || noAvailableProperties}
            >
              {submitting 
                ? t('agencyDashboard.pages.createLease.creating') 
                : t('agencyDashboard.pages.createLease.createLease')} 
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
