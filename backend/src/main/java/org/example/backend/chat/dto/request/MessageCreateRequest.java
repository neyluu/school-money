package org.example.backend.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageCreateRequest(
    @NotBlank(message = "Message cannot be empty")
    @Size(max = 2000, message = "Message must contain at most 2000 characters")
    String content
) {}
