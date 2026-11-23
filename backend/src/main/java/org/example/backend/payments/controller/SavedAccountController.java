package org.example.backend.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.payments.dto.request.SavedAccountCreateRequest;
import org.example.backend.payments.dto.response.SavedAccountResponse;
import org.example.backend.payments.service.SavedAccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments/saved-accounts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SavedAccountController {

    private final SavedAccountService savedAccountService;

    @Operation(summary = "Get saved external accounts of the user")
    @GetMapping
    public ResponseEntity<List<SavedAccountResponse>> getAll(
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(savedAccountService.getAll(user.id()));
    }

    @Operation(summary = "Save an external account")
    @PostMapping
    public ResponseEntity<SavedAccountResponse> add(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody SavedAccountCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            savedAccountService.add(user.id(), request)
        );
    }

    @Operation(summary = "Remove a saved external account")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer id
    ) {
        savedAccountService.remove(user.id(), id);
        return ResponseEntity.noContent().build();
    }
}
