package org.example.backend.auth.exception;

import org.example.backend.core.exception.ApiException;
import org.springframework.http.HttpStatus;

public class EmailAlreadyInUseException extends ApiException {
    public EmailAlreadyInUseException() {
        super(HttpStatus.CONFLICT, "Email is already in use");
    }
}
