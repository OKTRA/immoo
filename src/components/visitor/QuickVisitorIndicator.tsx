import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useQuickVisitorAccess } from '@/hooks/useQuickVisitorAccess';

export default function QuickVisitorIndicator() {
  const { visitorContact, isLoggedIn, logout } = useQuickVisitorAccess();

  if (!isLoggedIn) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center justify-center p-1.5 bg-green-100 text-green-800 rounded-full">
        <User className="h-3 w-3" />
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={logout}
        className="h-6 w-6 p-0"
      >
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  );
} 