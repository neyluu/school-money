package org.example.backend.classes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClassJoinRequest(
    @NotBlank(message = "Access code is required")
    String accessCode,

    @NotNull(message = "Child id is required")
    Integer childId
) {}
