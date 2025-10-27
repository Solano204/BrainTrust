package com.braintrust.shared.application.dtos.dtos;

// 📍 shared/application/dtos/notifications/PushNotificationDTO.java
public record PushNotificationDTO(
        String userId,
        String title,
        String message,
        String data
) {}
