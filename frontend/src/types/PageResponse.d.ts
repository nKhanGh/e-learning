interface PageResponse<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}