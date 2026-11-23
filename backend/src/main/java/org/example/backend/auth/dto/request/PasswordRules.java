package org.example.backend.auth.dto.request;

public final class PasswordRules
{
    public static final String PATTERN = "^[\\x20-\\x7E]{8,72}$";
    public static final String MESSAGE = "Password must have 8 to 72 characters and use only basic ASCII characters";

    private PasswordRules() {}
}
