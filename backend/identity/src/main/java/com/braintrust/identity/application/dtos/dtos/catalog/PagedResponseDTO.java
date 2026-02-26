package com.braintrust.identity.application.dtos.dtos.catalog;

import java.util.List;

public record PagedResponseDTO<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {
    public static <T> PagedResponseDTO<T> of(
            List<T> content, int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        return new PagedResponseDTO<>(
                content, page, size, totalElements, totalPages,
                page == 0, page >= totalPages - 1);
    }
}