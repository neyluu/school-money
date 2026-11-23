package org.example.backend.admin.dto.response;

import org.example.backend.core.entity.User;

public record AdminUserRefResponse(
    Integer id,
    String email,
    String firstName,
    String lastName
) {
    public static AdminUserRefResponse from(User user)
    {
        return new AdminUserRefResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );
    }
}