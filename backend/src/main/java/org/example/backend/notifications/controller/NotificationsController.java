package org.example.backend.notifications.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.notifications.dto.NotificationsResponse;
import org.example.backend.notifications.service.NotificationsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class NotificationsController {

    private final NotificationsService notificationsService;

    @Operation(
        summary = "Notifications for the treasurer: pending child requests and recent payments"
    )
    @GetMapping
    public NotificationsResponse get(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) String since
    ) {
        return notificationsService.get(user.id(), since);
    }
}
