package org.example.backend.classes.dto.response;

import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.types.MembershipStatus;

import java.time.Instant;

public record MembershipResponse(
    Integer classId,
    Integer childId,
    String childFirstName,
    String childLastName,
    MembershipStatus status,
    Instant requestedAt,
    Instant decidedAt
) {
    public static MembershipResponse from(ClassMembership membership)
    {
        Child child = membership.getChild();
        return new MembershipResponse(
            membership.getSchoolClass().getId(),
            child.getId(),
            child.getFirstName(),
            child.getLastName(),
            membership.getStatus(),
            membership.getRequestedAt(),
            membership.getDecidedAt()
        );
    }
}
