package org.example.backend.core.repository;

import org.example.backend.core.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {
    @Query("""
        SELECT m FROM Message m JOIN FETCH m.sender
        WHERE m.conversation.id = :conversationId AND (:before IS NULL OR m.id < :before)
        ORDER BY m.id DESC
        """)
    List<Message> findLatest(
        @Param("conversationId") Integer conversationId,
        @Param("before") Integer before,
        Pageable pageable
    );

    @Query("""
        SELECT m FROM Message m JOIN FETCH m.sender
        WHERE m.conversation.id = :conversationId AND m.id > :after
        ORDER BY m.id ASC
        """)
    List<Message> findNewer(
        @Param("conversationId") Integer conversationId,
        @Param("after") Integer after,
        Pageable pageable
    );

    @Query("""
        SELECT m FROM Message m JOIN FETCH m.sender
        WHERE m.id IN (
            SELECT MAX(m2.id) FROM Message m2
            WHERE m2.conversation.id IN :conversationIds
            GROUP BY m2.conversation.id
        )
        """)
    List<Message> findLastMessages(@Param("conversationIds") Collection<Integer> conversationIds);

    // Messages from other users newer than the last read message
    @Query("""
        SELECT m.conversation.id AS conversationId, COUNT(m) AS count FROM Message m
        LEFT JOIN ConversationReadState r ON r.conversation = m.conversation AND r.user.id = :userId
        WHERE m.conversation.id IN :conversationIds AND m.sender.id <> :userId
          AND (r.lastReadMessageId IS NULL OR m.id > r.lastReadMessageId)
        GROUP BY m.conversation.id
        """)
    List<UnreadCount> countUnread(
        @Param("conversationIds") Collection<Integer> conversationIds,
        @Param("userId") Integer userId
    );

    @Query("SELECT MAX(m.id) FROM Message m WHERE m.conversation.id = :conversationId")
    Integer findLastMessageId(@Param("conversationId") Integer conversationId);

    interface UnreadCount {
        Integer getConversationId();

        Long getCount();
    }
}
