import type { FeesFilters } from "@/types/dashboard";
import { useEffect, useState } from "react";

interface UseFeePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  filters?: FeesFilters;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function useFeePagination<T>({
  items,
  itemsPerPage = 10,
  filters,
}: UseFeePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems: items.length,
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    paginationInfo,
    setCurrentPage,
  };
}
