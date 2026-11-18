package org.example.backend.auth.mapper;

import org.example.backend.auth.dto.response.UserResponse;
import org.example.backend.core.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getCreatedAt()
        );
    }
}