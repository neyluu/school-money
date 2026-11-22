package org.example.backend.classes.dto.response;

import org.example.backend.core.entity.User;

public record PersonResponse(
    Integer id,
    String firstName,
    String lastName
) {
    public static PersonResponse from(User user)
    {
        return new PersonResponse(user.getId(), user.getFirstName(), user.getLastName());
    }
}
