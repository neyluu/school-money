package org.example.backend.admin.dto.response;

public record AdminStatsResponse(
    long users,
    long treasurers,
    long activeFundraisings,
    long finishedFundraisings,
    long closedFundraisings,
    long cancelledFundraisings,
    long blockedUsers,
    long blockedClasses,
    long blockedFundraisings
) {}