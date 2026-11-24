package org.example.backend.admin.dto.response;

import org.example.backend.classes.dto.response.ClassChildResponse;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.SchoolClass;

import java.time.Instant;
import java.util.List;

public record AdminClassResponse(
    Integer id,
    String name,
    String school,
    String city,
    AdminUserRefResponse owner,
    long memberCount,
    long fundraisingCount,
    boolean isBlocked,
    Instant deletedAt,
    Instant createdAt,

    String accessCode,
    Instant updatedAt,
    List<ClassChildResponse> members,
    List<AdminFundraisingResponse> fundraisings
) {
    public static AdminClassResponse from(SchoolClass schoolClass, long memberCount, long fundraisingCount)
    {
        return new AdminClassResponse(
            schoolClass.getId(),
            schoolClass.getName(),
            schoolClass.getSchool(),
            schoolClass.getCity(),
            AdminUserRefResponse.from(schoolClass.getOwner()),
            memberCount,
            fundraisingCount,
            schoolClass.getIsBlocked(),
            schoolClass.getDeletedAt(),
            schoolClass.getCreatedAt(),
            null,
            null,
            null,
            null
        );
    }

    public static AdminClassResponse details(
        SchoolClass schoolClass,
        List<ClassMembership> members,
        List<AdminFundraisingResponse> fundraisings
    )
    {
        return new AdminClassResponse(
            schoolClass.getId(),
            schoolClass.getName(),
            schoolClass.getSchool(),
            schoolClass.getCity(),
            AdminUserRefResponse.from(schoolClass.getOwner()),
            members.size(),
            fundraisings.size(),
            schoolClass.getIsBlocked(),
            schoolClass.getDeletedAt(),
            schoolClass.getCreatedAt(),
            schoolClass.getAccessCode(),
            schoolClass.getUpdatedAt(),
            members.stream().map(membership -> ClassChildResponse.from(membership.getChild())).toList(),
            fundraisings
        );
    }
}