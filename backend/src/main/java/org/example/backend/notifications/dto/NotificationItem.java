package org.example.backend.notifications.dto;

import java.time.Instant;

public record NotificationItem(
    String id,
    String type,
    String title,
    String description,
    String link,
    Instant createdAt
) {
    public static final String PENDING_REQUESTS = "PENDING_REQUESTS";
    public static final String NEW_PAYMENT = "NEW_PAYMENT";
}
