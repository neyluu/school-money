package org.example.backend.core.repository;

import org.example.backend.core.entity.ConversationReadState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationReadStateRepository extends JpaRepository<ConversationReadState, Integer> {
    Optional<ConversationReadState> findByConversationIdAndUserId(Integer conversationId, Integer userId);
}
