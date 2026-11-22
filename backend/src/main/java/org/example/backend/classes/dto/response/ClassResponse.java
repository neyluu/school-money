package org.example.backend.classes.dto.response;

import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.SchoolClass;

import java.time.Instant;
import java.util.List;

public record ClassResponse(
    Integer id,
    String name,
    String school,
    String city,
    String accessCode,
    boolean isOwner,
    PersonResponse owner,
    List<ClassChildResponse> children,
    Instant createdAt
) {
    public static ClassResponse from(SchoolClass schoolClass, boolean isOwner, List<ClassMembership> acceptedMemberships)
    {
        return new ClassResponse(
            schoolClass.getId(),
            schoolClass.getName(),
            schoolClass.getSchool(),
            schoolClass.getCity(),
            isOwner ? schoolClass.getAccessCode() : null,
            isOwner,
            PersonResponse.from(schoolClass.getOwner()),
            acceptedMemberships.stream().map(membership -> ClassChildResponse.from(membership.getChild())).toList(),
            schoolClass.getCreatedAt()
        );
    }
}
