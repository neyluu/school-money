package org.example.backend.payments.dto.response;

import java.math.BigDecimal;

public record WalletResponse(
    Integer id,
    String iban,
    BigDecimal balance
) {}
