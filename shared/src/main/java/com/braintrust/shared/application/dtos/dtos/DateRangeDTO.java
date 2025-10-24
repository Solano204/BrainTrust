package com.braintrust.shared.application.dtos.dtos;


public record DateRangeDTO(
        String startDate,  // ISO-8601 format
        String endDate
) {}