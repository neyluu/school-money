package org.example.backend.notifications.dto;

import java.util.List;

public record NotificationsResponse(
    boolean treasurer,
    List<NotificationItem> items
) {}
