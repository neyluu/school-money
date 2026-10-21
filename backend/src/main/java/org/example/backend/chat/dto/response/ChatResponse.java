package org.example.backend.chat.dto.response;

import org.example.backend.core.entity.Conversation;
import org.example.backend.core.entity.Message;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.ConversationType;

import java.time.Instant;

public record ChatResponse(
    Integer id,
    ConversationType type,
    String title,
    Integer classId,
    ChatUserResponse otherUser,
    MessageResponse lastMessage,
    long unreadCount,
    Instant createdAt
) {
    public static ChatResponse from(Conversation conversation, Integer userId, Message lastMessage, long unreadCount)
    {
        boolean isClass = conversation.getType() == ConversationType.CLASS;
        User otherUser = isClass ? null : otherUser(conversation, userId);

        return new ChatResponse(
            conversation.getId(),
            conversation.getType(),
            isClass ? conversation.getSchoolClass().getName() : otherUser.getFirstName() + " " + otherUser.getLastName(),
            isClass ? conversation.getSchoolClass().getId() : null,
            otherUser != null ? ChatUserResponse.from(otherUser) : null,
            lastMessage != null ? MessageResponse.from(lastMessage) : null,
            unreadCount,
            conversation.getCreatedAt()
        );
    }

    private static User otherUser(Conversation conversation, Integer userId)
    {
        return conversation.getUserA().getId().equals(userId) ? conversation.getUserB() : conversation.getUserA();
    }
}
