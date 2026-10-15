package org.example.backend.classes.dto.response;

import org.example.backend.core.entity.SchoolClass;

public record ClassLookupResponse(
    Integer id,
    String name,
    String school,
    String city
) {
    public static ClassLookupResponse from(SchoolClass schoolClass)
    {
        return new ClassLookupResponse(
            schoolClass.getId(),
            schoolClass.getName(),
            schoolClass.getSchool(),
            schoolClass.getCity()
        );
    }
}
