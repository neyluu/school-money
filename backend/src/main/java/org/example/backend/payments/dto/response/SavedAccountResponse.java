package org.example.backend.payments.dto.response;

import org.example.backend.payments.entity.SavedAccount;

public record SavedAccountResponse(
    Integer id,
    String recipientName,
    String iban
) {
    public static SavedAccountResponse from(SavedAccount account) {
        return new SavedAccountResponse(
            account.getId(),
            account.getRecipientName(),
            account.getIban()
        );
    }
}
