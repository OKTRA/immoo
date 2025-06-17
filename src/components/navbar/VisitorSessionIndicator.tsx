import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut } from 'lucide-react';
import { useVisitorSession } from '@/hooks/useVisitorSession';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export default function VisitorSessionIndicator() {
  const { session, isConnected, logout, getContactInfo, getSessionDuration } = useVisitorSession();

  if (!isConnected || !session) {
    return null;
  }

  const contactInfo = getContactInfo();
  const duration = getSessionDuration();

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté de votre session visiteur.",
      variant: "default"
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="relative">
            <User className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">Session Visiteur</p>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Connecté
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              Actif depuis {formatDuration(duration)}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {contactInfo && (
          <>
            <div className="px-2 py-1.5">
              {contactInfo.name && (
                <p className="text-sm font-medium">{contactInfo.name}</p>
              )}
              {contactInfo.email && (
                <p className="text-xs text-muted-foreground">{contactInfo.email}</p>
              )}
              {contactInfo.phone && (
                <p className="text-xs text-muted-foreground">{contactInfo.phone}</p>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 