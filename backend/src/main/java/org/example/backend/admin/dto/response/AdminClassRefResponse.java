package org.example.backend.admin.dto.response;

import org.example.backend.core.entity.SchoolClass;

public record AdminClassRefResponse(
    Integer id,
    String name,
    String school,
    String city
) {
    public static AdminClassRefResponse from(SchoolClass schoolClass)
    {
        return new AdminClassRefResponse(
            schoolClass.getId(),
            schoolClass.getName(),
            schoolClass.getSchool(),
            schoolClass.getCity()
        );
    }
}