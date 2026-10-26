package org.example.backend.core.entity.types;

import java.util.List;

public enum MembershipStatus
{
    PENDING,
    ACCEPTED,
    REJECTED;

    public static final List<MembershipStatus> ACTIVE = List.of(PENDING, ACCEPTED);
}
