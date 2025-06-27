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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById } from "@/services/agency";
import ImmooLogoAdaptive from "@/components/ui/ImmooLogoAdaptive";
import ImmooFavicon from "@/components/ui/ImmooFavicon";

export default function AgencySidebar() {
  const { agencyId } = useParams();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
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
      title: "Vue d'ensemble",
      icon: Building2,
      path: `/agencies/${agencyId}`,
      exact: true
    },
    {
      title: "Propriétés",
      icon: Home,
      path: `/agencies/${agencyId}/properties`,
    },
    {
      title: "Locataires",
      icon: Users,
      path: `/agencies/${agencyId}/tenants`,
    },
    {
      title: "Baux",
      icon: FileText,
      path: `/agencies/${agencyId}/leases`,
    },
    {
      title: "Paiements",
      icon: CreditCard,
      path: `/agencies/${agencyId}/payments`,
    },
    {
      title: "Gains",
      icon: DollarSign,
      path: `/agencies/${agencyId}/earnings`,
    },
    {
      title: "Paramètres",
      icon: Settings,
      path: `/agencies/${agencyId}/settings`,
    },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
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
        <nav className="space-y-2 px-4">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-4 px-4 rounded-xl transition-all duration-200 group",
                isActive(item.path, item.exact) 
                  ? "bg-gradient-to-r from-immoo-gold to-immoo-navy text-white shadow-lg" 
                  : "text-immoo-navy hover:bg-immoo-pearl/50 hover:text-immoo-navy",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <item.icon className={cn(
                "h-7 w-7 transition-colors", 
                collapsed ? "mr-0" : "mr-4",
                isActive(item.path, item.exact) 
                  ? "text-white" 
                  : "text-immoo-navy group-hover:text-immoo-gold"
              )} />
              {!collapsed && (
                <span className="font-medium text-base">
                  {item.title}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer avec informations de l'agence */}
      {!collapsed && agency && (
        <div className="p-4 border-t border-immoo-gray/20 bg-gradient-to-r from-immoo-pearl/30 to-immoo-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-immoo-gold to-immoo-navy flex items-center justify-center relative">
              {agency.logoUrl ? (
                <>
                  <img 
                    key={agency.logoUrl} // Force re-render when logoUrl changes
                    src={`${agency.logoUrl}?t=${Date.now()}`} 
                    alt={agency.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading agency logo in sidebar footer:', e);
                      console.error('Failed URL:', agency.logoUrl);
                      // Hide the image and show the fallback icon
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log('Agency logo loaded successfully in sidebar footer');
                      console.log('Loaded URL:', agency.logoUrl);
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                </>
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-immoo-navy truncate">
                {agency.name}
              </p>
              <p className="text-xs text-immoo-gray truncate">
                {agency.location}
              </p>
              {/* Debug info - à supprimer après test */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-immoo-gold">
                  Logo: {agency.logoUrl ? '✓' : '✗'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
