package org.example.backend.payments.exception;

import org.example.backend.core.exception.ApiException;
import org.springframework.http.HttpStatus;

public class InsufficientFundsException extends ApiException {
    public InsufficientFundsException() {
        super(HttpStatus.UNPROCESSABLE_ENTITY, "Insufficient funds");
    }
}
