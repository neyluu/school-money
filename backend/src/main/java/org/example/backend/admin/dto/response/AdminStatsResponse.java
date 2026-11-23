package org.example.backend.admin.dto.response;

public record AdminStatsResponse(
    long users,
    long treasurers,
    long activeFundraisings,
    long blockedUsers,
    long blockedClasses,
    long blockedFundraisings
) {}