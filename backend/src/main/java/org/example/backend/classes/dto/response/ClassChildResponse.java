package org.example.backend.classes.dto.response;

import org.example.backend.core.entity.Child;

public record ClassChildResponse(
    Integer id,
    String firstName,
    String lastName,
    Integer avatarId,
    PersonResponse parent
) {
    public static ClassChildResponse from(Child child)
    {
        return new ClassChildResponse(
            child.getId(),
            child.getFirstName(),
            child.getLastName(),
            child.getAvatarFile() != null ? child.getAvatarFile().getId() : null,
            PersonResponse.from(child.getParent())
        );
    }
}
