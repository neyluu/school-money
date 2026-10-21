package org.example.backend.classes.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClassUpdateRequest(
    @Pattern(regexp = ".*\\S.*", message = "Name cannot be empty")
    @Size(max = 100, message = "Name must contain at most 100 characters")
    String name,

    @Pattern(regexp = ".*\\S.*", message = "School cannot be empty")
    @Size(max = 200, message = "School must contain at most 200 characters")
    String school,

    @Pattern(regexp = ".*\\S.*", message = "City cannot be empty")
    @Size(max = 100, message = "City must contain at most 100 characters")
    String city
) {}
