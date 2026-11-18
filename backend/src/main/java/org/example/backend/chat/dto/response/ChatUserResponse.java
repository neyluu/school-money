package org.example.backend.chat.dto.response;

import org.example.backend.core.entity.User;

public record ChatUserResponse(
    Integer id,
    String firstName,
    String lastName
) {
    public static ChatUserResponse from(User user)
    {
        return new ChatUserResponse(user.getId(), user.getFirstName(), user.getLastName());
    }
}
