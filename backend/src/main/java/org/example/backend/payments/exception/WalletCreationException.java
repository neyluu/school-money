package org.example.backend.payments.exception;

public class WalletCreationException extends RuntimeException
{
    public WalletCreationException(String message)
    {
        super(message);
    }
}
