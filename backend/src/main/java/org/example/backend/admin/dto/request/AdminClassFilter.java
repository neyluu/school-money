package org.example.backend.admin.dto.request;

import jakarta.validation.constraints.Size;

public record AdminClassFilter(
    @Size(max = 100, message = "Search must contain at most 100 characters")
    String search,

    Boolean blocked,
    Integer ownerId,
    Boolean includeDeleted
) {}