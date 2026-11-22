package org.example.backend.core.dto.response;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    Map<String, String> fieldErrors
)
{}