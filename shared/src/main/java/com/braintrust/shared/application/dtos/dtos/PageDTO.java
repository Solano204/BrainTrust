package com.braintrust.shared.application.dtos.dtos;

import java.util.List;

// 📍 shared/application/dtos/PageDTO.java
public record PageDTO<T>(
        List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {}