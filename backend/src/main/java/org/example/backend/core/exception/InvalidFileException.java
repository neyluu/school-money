package org.example.backend.core.exception;

public class InvalidFileException extends RuntimeException
{
    public InvalidFileException(String message)
    {
        super(message);
    }
}
