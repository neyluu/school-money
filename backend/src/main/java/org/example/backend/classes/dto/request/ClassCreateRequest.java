package org.example.backend.classes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClassCreateRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must contain at most 100 characters")
    String name,

    @NotBlank(message = "School is required")
    @Size(max = 200, message = "School must contain at most 200 characters")
    String school,

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must contain at most 100 characters")
    String city
) {}
