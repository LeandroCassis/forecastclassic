
import React from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis 
} from '@/components/ui/pagination';

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  setCurrentPage
}) => {
  const MAX_PAGE_LINKS = 5;

  const getPaginationItems = (currentPage: number, totalPages: number) => {
    const pages = [];
    const half = Math.floor(MAX_PAGE_LINKS / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    
    if (currentPage - half <= 0) {
      end = Math.min(totalPages, end + (half - currentPage + 1));
    }
    
    if (currentPage + half > totalPages) {
      start = Math.max(1, start - (currentPage + half - totalPages));
    }
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 mb-4 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
              aria-disabled={currentPage === 1} 
            />
          </PaginationItem>
          
          {getPaginationItems(currentPage, totalPages).map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink 
                  onClick={() => setCurrentPage(Number(page))} 
                  isActive={currentPage === page} 
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
              aria-disabled={currentPage === totalPages} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationComponent;
