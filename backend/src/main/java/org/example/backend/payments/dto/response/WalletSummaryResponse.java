package org.example.backend.payments.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record WalletSummaryResponse(
    int days,
    BigDecimal income,
    BigDecimal expense,
    List<DailyFlowResponse> daily
) {}
