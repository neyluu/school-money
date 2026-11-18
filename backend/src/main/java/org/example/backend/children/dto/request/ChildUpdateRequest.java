package org.example.backend.children.dto.request;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ChildUpdateRequest(
    @Size(min = 2, max = 100, message = "Firstname must contain between 2 and 100 characters")
    String firstname,

    @Size(min = 2, max = 100, message = "Lastname must contain between 2 and 100 characters")
    String lastname,

    @Past(message = "Birth date must be in the past")
    LocalDate birthDate
) {}
