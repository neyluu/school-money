package org.example.backend.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AccountDeleteRequest(
    @NotBlank String password
)
{}
