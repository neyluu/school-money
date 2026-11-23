package org.example.backend.core.repository;

import org.example.backend.core.entity.ConversationReadState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

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

    @Modifying
    @Query(value = """
        INSERT INTO conversation_read_states (conversation_id, user_id, hidden_up_to_message_id, updated_at)
        VALUES (:conversationId, :userId, :messageId, timezone('UTC', now()))
        ON CONFLICT (conversation_id, user_id) DO UPDATE
        SET hidden_up_to_message_id = EXCLUDED.hidden_up_to_message_id
        """, nativeQuery = true)
    void setHiddenUpTo(
        @Param("conversationId") Integer conversationId,
        @Param("userId") Integer userId,
        @Param("messageId") Integer messageId
    );

    @Query("""
        SELECT r.conversation.id AS conversationId, r.hiddenUpToMessageId AS hiddenUpTo FROM ConversationReadState r
        WHERE r.user.id = :userId AND r.conversation.id IN :conversationIds AND r.hiddenUpToMessageId IS NOT NULL
        """)
    List<HiddenState> findHidden(
        @Param("conversationIds") Collection<Integer> conversationIds,
        @Param("userId") Integer userId
    );

    interface HiddenState {
        Integer getConversationId();

        Integer getHiddenUpTo();
    }
}
