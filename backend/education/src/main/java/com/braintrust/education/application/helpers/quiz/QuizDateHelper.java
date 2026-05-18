package com.braintrust.education.application.helpers.quiz;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class QuizDateHelper {

    private static final Logger log = LoggerFactory.getLogger(QuizDateHelper.class);

    public LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Date parameter cannot be null or empty");
        }

        try {
            if (dateTimeStr.endsWith("Z")) {
                return Instant.parse(dateTimeStr)
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();
            }
            return LocalDateTime.parse(dateTimeStr);

        } catch (Exception e) {
            log.error("Failed to parse date time '{}': {}", dateTimeStr, e.getMessage());
            throw new IllegalArgumentException(
                    "Invalid date format. Use ISO format like '2025-11-20T08:00:00' or '2025-11-20T08:00:00Z'"
            );
        }
    }

    public LocalDateTime parseDateTimeNullable(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            return null;
        }
        return parseDateTime(dateTimeStr);
    }

    public LocalDateTime parseInstant(String instantStr) {
        if (instantStr == null || instantStr.trim().isEmpty()) {
            return null;
        }

        try {
            return Instant.parse(instantStr)
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (Exception e) {
            log.error("Failed to parse instant '{}': {}", instantStr, e.getMessage());
            throw new IllegalArgumentException("Invalid instant format");
        }
    }

    public LocalDateTime getMonthEnd(String monthStart) {
        LocalDateTime start = parseDateTime(monthStart);
        return start.plusMonths(1);
    }

    public LocalDateTime getWeekEnd(String weekStart) {
        LocalDateTime start = parseDateTime(weekStart);
        return start.plusDays(7);
    }
}