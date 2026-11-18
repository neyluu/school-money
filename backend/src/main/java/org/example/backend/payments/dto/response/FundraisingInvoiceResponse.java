package org.example.backend.payments.dto.response;

import org.example.backend.core.dto.response.FileInfoDto;

import java.time.Instant;

public record FundraisingInvoiceResponse(
    Integer id,
    String title,
    FileInfoDto file,
    Instant createdAt
) {}
