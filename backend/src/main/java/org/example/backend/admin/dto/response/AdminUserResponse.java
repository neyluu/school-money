package org.example.backend.admin.dto.response;

import org.example.backend.children.dto.response.ChildResponse;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.UserRole;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminUserResponse(
    Integer id,
    String email,
    String firstName,
    String lastName,
    UserRole role,
    boolean isBlocked,
    Instant createdAt,
    Instant updatedAt,
    List<AdminClassRefResponse> classes,

    List<ChildResponse> children,
    BigDecimal walletBalance,
    Long ownedFundraisingCount
) {
    public static AdminUserResponse from(User user, List<SchoolClass> classes)
    {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getIsBlocked(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            classes.stream().map(AdminClassRefResponse::from).toList(),
            null,
            null,
            null
        );
    }

    public static AdminUserResponse details(
        User user,
        List<SchoolClass> classes,
        List<Child> children,
        BigDecimal walletBalance,
        long ownedFundraisingCount
    )
    {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getIsBlocked(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            classes.stream().map(AdminClassRefResponse::from).toList(),
            children.stream().map(ChildResponse::from).toList(),
            walletBalance,
            ownedFundraisingCount
        );
    }
}