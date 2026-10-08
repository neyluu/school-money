package org.example.backend.auth.dto.response;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    UserResponse user
)
{}