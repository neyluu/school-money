package org.example.backend.children.dto.response;

import org.example.backend.core.entity.Child;

import java.time.LocalDate;

public record ChildResponse(
    Integer id,
    String firstname,
    String lastname,
    LocalDate birthDate,
    Integer avatarId
) {
    public static ChildResponse from(Child child)
    {
        return new ChildResponse(
            child.getId(),
            child.getFirstName(),
            child.getLastName(),
            child.getBirthDate(),
            getAvatarId(child)
        );
    }

    private static Integer getAvatarId(Child child)
    {
        return child.getAvatarFile() != null ? child.getAvatarFile().getId() : null;
    }
}
