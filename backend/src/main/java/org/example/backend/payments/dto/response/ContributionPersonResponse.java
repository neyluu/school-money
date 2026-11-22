package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.User;

public record ContributionPersonResponse(
    Integer id,
    String firstName,
    String lastName
)
{
    public static ContributionPersonResponse from(User user)
    {
        return new ContributionPersonResponse(user.getId(), user.getFirstName(), user.getLastName());
    }

    public static ContributionPersonResponse from(Child child)
    {
        return new ContributionPersonResponse(child.getId(), child.getFirstName(), child.getLastName());
    }
}
