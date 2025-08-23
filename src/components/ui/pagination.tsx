import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageNumbers = 7,
  className
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfRange = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, currentPage + halfRange);

    // Ajuster si on est près du début ou de la fin
    if (currentPage <= halfRange) {
      end = Math.min(totalPages, maxPageNumbers);
    }
    if (currentPage > totalPages - halfRange) {
      start = Math.max(1, totalPages - maxPageNumbers + 1);
    }

    const pages = [];
    
    // Ajouter la première page si nécessaire
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Ajouter les pages du milieu
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ajouter la dernière page si nécessaire
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-center space-x-1', className)}>
      {/* Bouton précédent */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Précédent</span>
      </Button>

      {/* Numéros de page */}
      {showPageNumbers && (
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`ellipsis-${index}`} className="px-3 py-2">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  'min-w-[40px]',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
      )}

      {/* Bouton suivant */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center space-x-1"
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  total: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  total,
  className
}: PaginationInfoProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      Affichage de {start} à {end} sur {total} résultats
    </div>
  );
}

interface PaginationContainerProps {
  children: React.ReactNode;
  pagination: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
}

export function PaginationContainer({
  children,
  pagination,
  info,
  className
}: PaginationContainerProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
      
      <div className="flex items-center justify-between">
        {info && <div>{info}</div>}
        <div className="flex-1 flex justify-center">
          {pagination}
        </div>
        <div className="w-0 sm:w-auto" />
      </div>
    </div>
  );
}