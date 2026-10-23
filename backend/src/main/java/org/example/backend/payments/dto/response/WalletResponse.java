package org.example.backend.payments.dto.response;

import org.example.backend.core.entity.Wallet;

import java.math.BigDecimal;

public record WalletResponse(
    Integer id,
    String iban,
    BigDecimal balance
)
{
    public static WalletResponse from(Wallet wallet)
    {
        return new WalletResponse(
            wallet.getId(),
            wallet.getIban(),
            wallet.getBalance()
        );
    }
}
