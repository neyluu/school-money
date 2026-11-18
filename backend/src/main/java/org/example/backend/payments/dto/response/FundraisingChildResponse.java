package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.Child;

import java.math.BigDecimal;

public record FundraisingChildResponse(
    Integer id,
    String firstName,
    String lastName,
    Integer avatarId,
    boolean isMine,
    BigDecimal paidAmount,
    BigDecimal remainingAmount,
    boolean isPaid
)
{
    public static FundraisingChildResponse from(Child child, boolean isMine, BigDecimal paidAmount, BigDecimal amountPerChild)
    {
        BigDecimal remaining = amountPerChild.subtract(paidAmount).max(BigDecimal.ZERO);

        return new FundraisingChildResponse(
            child.getId(),
            child.getFirstName(),
            child.getLastName(),
            child.getAvatarFile() != null ? child.getAvatarFile().getId() : null,
            isMine,
            paidAmount,
            remaining,
            remaining.signum() == 0
        );
    }
}
