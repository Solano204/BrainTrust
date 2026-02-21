export interface PaginatedResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
    role?: string;
    active?: boolean;
    teacherId?: string;
    grade?: string;
    group?: string;
}