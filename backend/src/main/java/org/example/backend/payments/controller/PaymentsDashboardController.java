package org.example.backend.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.payments.dto.response.DueResponse;
import org.example.backend.payments.dto.response.OwnedFundraisingResponse;
import org.example.backend.payments.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payments/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PaymentsDashboardController
{
    private final DashboardService dashboardService;

    @Operation(
        summary = "Get outstanding payments for children of the user, nearest deadline first",
        description = "Only active, not blocked fundraisings that still accept payments, for children accepted to the class"
    )
    @GetMapping("/dues")
    public ResponseEntity<List<DueResponse>> getDues(@AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(dashboardService.getDues(user.id()));
    }


    @Operation(
        summary = "Get fundraisings of classes owned by the user with balances and payment progress, newest first"
    )
    @GetMapping("/fundraisings")
    public ResponseEntity<List<OwnedFundraisingResponse>> getOwnedFundraisings(
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        return ResponseEntity.ok(dashboardService.getOwnedFundraisings(user.id()));
    }
}
