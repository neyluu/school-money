package org.example.backend.auth.dto.response;

import org.example.backend.core.entity.types.UserRole;
import java.time.Instant;

public record UserResponse(
    Integer id,
    String email,
    String firstName,
    String lastName,
    UserRole role,
    Instant createdAt
)
{}