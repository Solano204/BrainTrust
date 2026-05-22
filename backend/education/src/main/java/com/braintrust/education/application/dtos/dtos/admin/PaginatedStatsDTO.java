package com.braintrust.education.application.dtos.dtos.admin;

import java.util.List;

// PaginatedStatsDTO.java
public record PaginatedStatsDTO<T>(
        List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {}