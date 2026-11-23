package org.example.backend.payments.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.example.backend.payments.utils.RegexConstants;

public record SavedAccountCreateRequest(
    @NotBlank(message = "Recipient name is required")
    @Size(
        max = 100,
        message = "Recipient name must contain at most 100 characters"
    )
    String recipientName,

    @NotBlank(message = "Iban cannot be blank")
    @Size(min = 28, max = 28, message = "Iban must have 28 characters")
    @Pattern(
        regexp = RegexConstants.IBAN_REGEX,
        message = "Iban must have form PL[26 digits]"
    )
    String iban
) {}
