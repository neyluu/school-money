package org.example.backend.chat.dto.response;

import org.example.backend.core.entity.Message;

import java.time.Instant;

public record MessageResponse(
    Integer id,
    Integer chatId,
    ChatUserResponse sender,
    String content,
    Instant createdAt
) {
    public static MessageResponse from(Message message)
    {
        return new MessageResponse(
            message.getId(),
            message.getConversation().getId(),
            ChatUserResponse.from(message.getSender()),
            message.getContent(),
            message.getCreatedAt()
        );
    }
}
