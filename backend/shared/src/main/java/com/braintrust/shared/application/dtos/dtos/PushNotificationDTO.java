package com.braintrust.shared.application.dtos.dtos;

public record PushNotificationDTO(
        String userId,
        String title,
        String message,
        String data
) {}
