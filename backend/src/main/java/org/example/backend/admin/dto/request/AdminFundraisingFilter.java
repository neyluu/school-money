package org.example.backend.admin.dto.request;

import jakarta.validation.constraints.Size;
import org.example.backend.core.entity.types.FundraisingStatus;

public record AdminFundraisingFilter(
    @Size(max = 100, message = "Search must contain at most 100 characters")
    String search,

    FundraisingStatus status,
    Boolean blocked,
    Integer classId,
    Integer ownerId
) {}