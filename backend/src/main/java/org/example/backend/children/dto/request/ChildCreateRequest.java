package org.example.backend.children.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ChildCreateRequest(
    @NotBlank(message = "Firstname is required")
    @Size(min = 2, max = 100, message = "Firstname must contain between 2 and 100 characters")
    String firstname,

    @NotBlank(message = "Lastname is required")
    @Size(min = 2, max = 100, message = "Lastname must contain between 2 and 100 characters")
    String lastname,

    @NotNull(message = "Birth date cannot be empty")
    @Past(message = "Birth date must be in the past")
    LocalDate birthDate
) {}
