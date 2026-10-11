package org.example.backend.core.dto.response;

public record FileDto(
    Integer id,
    String filename,
    String contentType,
    int sizeBytes,
    byte[] data
)
{}
