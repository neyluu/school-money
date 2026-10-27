package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.types.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;

public record FundraisingTransferResponse(
    Integer id,
    TransactionType type,
    BigDecimal amount,
    String title,
    Instant createdAt,
    Instant completedAt
)
{
    public static FundraisingTransferResponse from(Transaction transaction)
    {
        return new FundraisingTransferResponse(
            transaction.getId(),
            transaction.getType(),
            transaction.getAmount(),
            transaction.getTitle(),
            transaction.getCreatedAt(),
            transaction.getCompletedAt()
        );
    }
}
