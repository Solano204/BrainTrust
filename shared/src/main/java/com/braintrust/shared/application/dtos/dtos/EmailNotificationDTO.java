package com.braintrust.shared.application.dtos.dtos;


public record EmailNotificationDTO(
        String to,
        String subject,
        String body,
        boolean isHtml
) {}