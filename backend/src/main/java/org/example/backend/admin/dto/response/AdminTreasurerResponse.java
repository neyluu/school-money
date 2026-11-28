package org.example.backend.admin.dto.response;

import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminTreasurerResponse(
    Integer id,
    String email,
    String firstName,
    String lastName,
    boolean isBlocked,
    Instant createdAt,
    List<AdminClassRefResponse> classes,
    long fundraisingCount,
    BigDecimal collected
) {
    public static AdminTreasurerResponse from(
        User user,
        List<SchoolClass> classes,
        long fundraisingCount,
        BigDecimal collected
    )
    {
        return new AdminTreasurerResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getIsBlocked(),
            user.getCreatedAt(),
            classes.stream().map(AdminClassRefResponse::from).toList(),
            fundraisingCount,
            collected
        );
    }
}