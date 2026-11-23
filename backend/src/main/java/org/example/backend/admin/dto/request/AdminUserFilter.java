package org.example.backend.admin.dto.request;

import jakarta.validation.constraints.Size;
import org.example.backend.core.entity.types.UserRole;

import java.time.Instant;

public record AdminUserFilter(
    @Size(max = 100, message = "Search must contain at most 100 characters")
    String search,

    UserRole role,
    Boolean blocked,
    Integer classId,
    Instant from,
    Instant to
) {}