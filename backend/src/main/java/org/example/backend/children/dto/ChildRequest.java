package org.example.backend.children.dto;

import java.time.LocalDate;

public record ChildRequest(
    String firstname,
    String lastname,
    LocalDate birthDate
) {}
