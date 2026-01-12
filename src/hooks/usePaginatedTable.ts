// ============================================
// usePaginatedTable Hook - Table pagination and sorting
// ============================================

import { useState, useCallback, useMemo } from 'react';
import type { PaginationParams, SortParams, FilterParams } from '@/types';

export interface UsePaginatedTableOptions<TFilter extends FilterParams = FilterParams> {
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  initialFilters?: TFilter;
}

export interface UsePaginatedTableReturn<TFilter extends FilterParams = FilterParams> {
  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;

  // Sorting
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  toggleSort: (column: string) => void;

  // Filters
  filters: TFilter;
  setFilter: <K extends keyof TFilter>(key: K, value: TFilter[K]) => void;
  setFilters: (filters: TFilter) => void;
  clearFilters: () => void;

  // Combined params for API calls
  paginationParams: PaginationParams;
  sortParams: SortParams;
  allParams: PaginationParams & SortParams & TFilter;

  // Helpers
  reset: () => void;
  getTotalPages: (totalCount: number) => number;
  getStartIndex: () => number;
  getEndIndex: (totalCount: number) => number;
}

export function usePaginatedTable<TFilter extends FilterParams = FilterParams>(
  options: UsePaginatedTableOptions<TFilter> = {}
): UsePaginatedTableReturn<TFilter> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialSortBy = 'created_at',
    initialSortOrder = 'desc',
    initialFilters = {} as TFilter,
  } = options;

  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sorting state
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Filter state
  const [filters, setFiltersState] = useState<TFilter>(initialFilters);

  // Pagination handlers
  const nextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback((totalPages: number) => {
    setPage(totalPages);
  }, []);

  // Reset to first page when page size changes
  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  // Sorting handlers
  const setSorting = useCallback((newSortBy: string, newSortOrder?: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    if (newSortOrder) {
      setSortOrder(newSortOrder);
    }
    setPage(1); // Reset to first page on sort change
  }, []);

  const toggleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(column);
        setSortOrder('asc');
      }
      setPage(1);
    },
    [sortBy]
  );

  // Filter handlers
  const setFilter = useCallback(<K extends keyof TFilter>(key: K, value: TFilter[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  }, []);

  const setFilters = useCallback((newFilters: TFilter) => {
    setFiltersState(newFilters);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setPage(1);
  }, [initialFilters]);

  // Reset all state
  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
    setFiltersState(initialFilters);
  }, [initialPage, initialPageSize, initialSortBy, initialSortOrder, initialFilters]);

  // Helper functions
  const getTotalPages = useCallback(
    (totalCount: number) => Math.ceil(totalCount / pageSize),
    [pageSize]
  );

  const getStartIndex = useCallback(() => (page - 1) * pageSize, [page, pageSize]);

  const getEndIndex = useCallback(
    (totalCount: number) => Math.min(page * pageSize, totalCount),
    [page, pageSize]
  );

  // Combined params
  const paginationParams: PaginationParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
    }),
    [page, pageSize]
  );

  const sortParams: SortParams = useMemo(
    () => ({
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [sortBy, sortOrder]
  );

  const allParams = useMemo(
    () => ({
      ...paginationParams,
      ...sortParams,
      ...filters,
    }),
    [paginationParams, sortParams, filters]
  );

  return useMemo(
    () => ({
      page,
      pageSize,
      setPage,
      setPageSize: handleSetPageSize,
      nextPage,
      prevPage,
      goToFirstPage,
      goToLastPage,
      sortBy,
      sortOrder,
      setSorting,
      toggleSort,
      filters,
      setFilter,
      setFilters,
      clearFilters,
      paginationParams,
      sortParams,
      allParams,
      reset,
      getTotalPages,
      getStartIndex,
      getEndIndex,
    }),
    [
      page,
      pageSize,
      handleSetPageSize,
      nextPage,
      prevPage,
      goToFirstPage,
      goToLastPage,
      sortBy,
      sortOrder,
      setSorting,
      toggleSort,
      filters,
      setFilter,
      setFilters,
      clearFilters,
      paginationParams,
      sortParams,
      allParams,
      reset,
      getTotalPages,
      getStartIndex,
      getEndIndex,
    ]
  );
}

export default usePaginatedTable;
