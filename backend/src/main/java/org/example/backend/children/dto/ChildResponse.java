package org.example.backend.children.dto;

import java.time.LocalDate;

public record ChildResponse(
    Integer id,
    String firstname,
    String lastname,
    LocalDate birthDate,

    Integer avatarId
) {}
