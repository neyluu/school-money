package org.example.backend.auth.exception;

import org.example.backend.core.exception.ApiException;
import org.springframework.http.HttpStatus;

public class AccountBlockedException extends ApiException {
    public AccountBlockedException() {
        super(HttpStatus.FORBIDDEN, "Account is blocked");
    }
}
