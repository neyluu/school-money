package org.example.backend.core.repository;

import org.example.backend.core.entity.ConversationReadState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationReadStateRepository extends JpaRepository<ConversationReadState, Integer> {
    @Modifying
    @Query(value = """
        INSERT INTO conversation_read_states (conversation_id, user_id, last_read_message_id, updated_at)
        VALUES (:conversationId, :userId, :messageId, timezone('UTC', now()))
        ON CONFLICT (conversation_id, user_id) DO UPDATE
        SET last_read_message_id = EXCLUDED.last_read_message_id
        WHERE conversation_read_states.last_read_message_id IS NULL
           OR conversation_read_states.last_read_message_id < EXCLUDED.last_read_message_id
        """, nativeQuery = true)
    void markReadUpTo(
        @Param("conversationId") Integer conversationId,
        @Param("userId") Integer userId,
        @Param("messageId") Integer messageId
    );
}
