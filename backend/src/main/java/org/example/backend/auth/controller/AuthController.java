package org.example.backend.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.dto.request.AccountDeleteRequest;
import org.example.backend.auth.dto.request.EmailChangeRequest;
import org.example.backend.auth.dto.request.LoginRequest;
import org.example.backend.auth.dto.request.PasswordChangeRequest;
import org.example.backend.auth.dto.request.ProfileUpdateRequest;
import org.example.backend.auth.dto.request.RegisterRequest;
import org.example.backend.auth.dto.response.AuthResponse;
import org.example.backend.auth.dto.response.UserResponse;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.auth.service.AccountService;
import org.example.backend.auth.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final AccountService accountService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(authService.getUser(user.id()));
    }

    @Operation(summary = "Change first and last name of the current user")
    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(accountService.updateProfile(user.id(), request));
    }

    @Operation(summary = "Change email of the current user, requires current password")
    @PutMapping("/me/email")
    public ResponseEntity<UserResponse> changeEmail(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody EmailChangeRequest request
    ) {
        return ResponseEntity.ok(accountService.changeEmail(user.id(), request));
    }

    @Operation(summary = "Change password of the current user, requires current password")
    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody PasswordChangeRequest request
    ) {
        accountService.changePassword(user.id(), request);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Delete account of the current user, requires password",
        description = """
            Personal data is anonymized and the account is blocked, payment history stays.
            Not possible while the user owns a class or has money in the wallet
            """
    )
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody AccountDeleteRequest request
    ) {
        accountService.deleteAccount(user.id(), request);
        return ResponseEntity.noContent().build();
    }
}
