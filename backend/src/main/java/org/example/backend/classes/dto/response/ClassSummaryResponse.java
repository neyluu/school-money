package org.example.backend.classes.dto.response;

import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.SchoolClass;

import java.time.Instant;
import java.util.List;

public record ClassSummaryResponse(
    Integer id,
    String name,
    String school,
    String city,
    boolean isOwner,
    PersonResponse owner,
    long childrenCount,
    List<MembershipResponse> myChildren,
    Instant deletedAt
) {
    public static ClassSummaryResponse from(
        SchoolClass schoolClass,
        boolean isOwner,
        long childrenCount,
        List<ClassMembership> myMemberships
    ) {
        return new ClassSummaryResponse(
            schoolClass.getId(),
            schoolClass.getName(),
            schoolClass.getSchool(),
            schoolClass.getCity(),
            isOwner,
            PersonResponse.from(schoolClass.getOwner()),
            childrenCount,
            myMemberships.stream().map(MembershipResponse::from).toList(),
            schoolClass.getDeletedAt()
        );
    }
}
