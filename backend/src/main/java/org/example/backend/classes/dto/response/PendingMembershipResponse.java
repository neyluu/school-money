package org.example.backend.classes.dto.response;

import org.example.backend.core.entity.ClassMembership;

import java.time.Instant;

public record PendingMembershipResponse(
    ClassChildResponse child,
    String parentEmail,
    Instant requestedAt
) {
    public static PendingMembershipResponse from(ClassMembership membership)
    {
        return new PendingMembershipResponse(
            ClassChildResponse.from(membership.getChild()),
            membership.getChild().getParent().getEmail(),
            membership.getRequestedAt()
        );
    }
}
