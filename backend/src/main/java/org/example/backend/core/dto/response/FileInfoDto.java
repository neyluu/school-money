package org.example.backend.core.dto.response;

public record FileInfoDto(
    Integer id,
    String filename,
    String contentType,
    int sizeBytes
) {}
