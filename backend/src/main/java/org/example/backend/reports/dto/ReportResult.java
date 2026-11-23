package org.example.backend.reports.dto;

import org.springframework.http.MediaType;

public record ReportResult(
    byte[] content,
    MediaType mediaType,
    String extension
) {}
