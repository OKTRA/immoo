import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Building2,
  Home,
  Users,
  FileText,
  CreditCard,
  DollarSign,
  Settings,
  Menu,
  LogOut,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById } from "@/services/agency";
import ImmooLogoAdaptive from "@/components/ui/ImmooLogoAdaptive";
import ImmooFavicon from "@/components/ui/ImmooFavicon";
import { useTranslation } from "@/hooks/useTranslation";

export default function AgencySidebar() {
  const { agencyId } = useParams();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  
  // Fetch agency details
  const { data: agencyData, isLoading } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
  
  const agency = agencyData?.agency || null;
  
  // Debug log pour voir si les données de l'agence changent
  useEffect(() => {
    if (agency) {
      console.log('Sidebar - Agency data updated:', {
        id: agency.id,
        name: agency.name,
        logoUrl: agency.logoUrl,
        hasLogo: !!agency.logoUrl
      });
    }
  }, [agency]);
  
  const navigationItems = [
    {
      title: t('agencyDashboard.sidebar.overview'),
      href: `/agencies/${agencyId}`,
      icon: Home,
      description: "Vue d'ensemble de votre agence"
    },
    {
      title: t('agencyDashboard.sidebar.properties'),
      href: `/agencies/${agencyId}/properties`,
      icon: Building2,
      description: "Gestion des propriétés"
    },
    {
      title: t('agencyDashboard.sidebar.tenants'),
      href: `/agencies/${agencyId}/tenants`,
      icon: Users,
      description: "Gestion des locataires"
    },
    {
      title: t('agencyDashboard.sidebar.contracts'),
      href: `/agencies/${agencyId}/contracts`,
      icon: FileText,
      description: "Gestion des contrats"
    },
    {
      title: t('agencyDashboard.sidebar.leases'),
      href: `/agencies/${agencyId}/leases`,
      icon: FileText,
      description: "Gestion des baux"
    },
    {
      title: t('agencyDashboard.sidebar.payments'),
      href: `/agencies/${agencyId}/payments`,
      icon: CreditCard,
      description: "Gestion des paiements"
    },
    {
      title: 'Gérer les ventes',
      href: `/agencies/${agencyId}/sales`,
      icon: DollarSign,
      description: "Gestion des propriétés en vente et suivi des commissions"
    },
    {
      title: t('agencyDashboard.sidebar.earnings'),
      href: `/agencies/${agencyId}/earnings`,
      icon: DollarSign,
      description: "Suivi des gains"
    },
    {
      title: t('agencyDashboard.sidebar.analytics'),
      href: `/agencies/${agencyId}/analytics`,
      icon: Receipt,
      description: "Analytics et rapports"
    },
    {
      title: t('agencyDashboard.sidebar.settings'),
      href: `/agencies/${agencyId}/settings`,
      icon: Settings,
      description: "Paramètres de l'agence"
    }
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className={cn(
        "h-screen flex flex-col bg-white/95 backdrop-blur-sm border-r border-immoo-gray/20 shadow-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Sidebar header with logo and collapse button */}
      <div className="flex items-center justify-between p-6 border-b border-immoo-gray/20 bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
        {!collapsed ? (
          <div className="flex items-center">
            <ImmooLogoAdaptive size="medium" />
          </div>
        ) : (
          <button 
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center w-full hover:bg-immoo-pearl/50 rounded-xl p-2 transition-colors"
            aria-label="Expand sidebar"
          >
            <ImmooFavicon size="medium" />
          </button>
        )}
        
        {!collapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hover:bg-immoo-gold/20 text-immoo-navy"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActiveRoute = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  "hover:bg-immoo-pearl/50 hover:text-immoo-navy",
                  isActiveRoute
                    ? "bg-immoo-gold/20 text-immoo-navy border-r-2 border-immoo-gold"
                    : "text-immoo-gray hover:text-immoo-navy"
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon 
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActiveRoute ? "text-immoo-gold" : "text-immoo-gray group-hover:text-immoo-navy"
                  )} 
                />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Agency info section */}
      {!collapsed && agency && (
        <div className="p-4 border-t border-immoo-gray/20 bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
          <div className="flex items-center space-x-3">
            {agency.logoUrl ? (
              <img 
                src={`${agency.logoUrl}?t=${Date.now()}`} 
                alt={agency.name || "Agency logo"} 
                className="h-8 w-8 rounded-lg object-cover border border-immoo-gray/20"
                onError={(e) => {
                  console.error('Error loading agency logo in sidebar:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-immoo-gold to-immoo-navy flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-immoo-navy truncate">
                {agency.name}
              </p>
              <p className="text-xs text-immoo-gray truncate">
                {agency.location || "Agence immobilière"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
