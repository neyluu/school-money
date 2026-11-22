package org.example.backend.chat.dto.request;

import jakarta.validation.constraints.NotNull;

public record PrivateChatRequest(
    @NotNull(message = "User id is required")
    Integer userId
) {}
