package org.example.backend.chat.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.chat.dto.request.MessageCreateRequest;
import org.example.backend.chat.dto.response.ChatResponse;
import org.example.backend.chat.dto.response.ChatUserResponse;
import org.example.backend.chat.dto.response.MessageResponse;
import org.example.backend.core.entity.Conversation;
import org.example.backend.core.entity.ConversationReadState;
import org.example.backend.core.entity.Message;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.ConversationType;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.entity.types.UserRole;
import org.example.backend.core.repository.ConversationReadStateRepository;
import org.example.backend.core.repository.ConversationRepository;
import org.example.backend.core.repository.MessageRepository;
import org.example.backend.core.repository.MessageRepository.UnreadCount;
import org.example.backend.core.repository.SchoolClassRepository;
import org.example.backend.core.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ChatService
{
    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 100;

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationReadStateRepository readStateRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<ChatResponse> getAll(Integer userId)
    {
        List<Integer> classIds = findClassIds(userId);

        List<Conversation> conversations = new ArrayList<>(getOrCreateClassConversations(classIds));
        conversations.addAll(conversationRepository.findAllPrivateForUser(userId));

        return toResponses(conversations, userId).stream()
                .sorted(Comparator.comparing(ChatService::lastActivity).reversed())
                .toList();
    }

    @Transactional
    public ChatResponse getClassChat(Integer classId, Integer userId)
    {
        if(!schoolClassRepository.existsById(classId))
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Class with id " + classId + " not found");
        }
        if(!findClassIds(userId).contains(classId))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this class chat");
        }

        Conversation conversation = getOrCreateClassConversations(List.of(classId)).getFirst();
        return toResponses(List.of(conversation), userId).getFirst();
    }

    @Transactional
    public ChatResponse getOrCreatePrivateChat(Integer targetUserId, AuthenticatedUser user)
    {
        if(targetUserId.equals(user.id()))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot start a chat with yourself");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with id " + targetUserId + " not found"));

        Integer userAId = Math.min(user.id(), target.getId());
        Integer userBId = Math.max(user.id(), target.getId());

        Conversation conversation = conversationRepository.findPrivate(userAId, userBId).orElse(null);
        if(conversation == null)
        {
            if(!canStartPrivateChat(user, target))
            {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only start a chat with members of your classes");
            }

            conversation = new Conversation();
            conversation.setType(ConversationType.PRIVATE);
            conversation.setUserA(userRepository.getReferenceById(userAId));
            conversation.setUserB(userRepository.getReferenceById(userBId));
            conversationRepository.saveAndFlush(conversation);
        }

        return toResponses(List.of(findAccessibleConversation(conversation.getId(), user.id())), user.id()).getFirst();
    }

    @Transactional(readOnly = true)
    public ChatResponse find(Integer chatId, Integer userId)
    {
        Conversation conversation = findAccessibleConversation(chatId, userId);
        return toResponses(List.of(conversation), userId).getFirst();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Integer chatId, Integer userId, Integer before, Integer after, Integer size)
    {
        findAccessibleConversation(chatId, userId);

        if(before != null && after != null)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parameters before and after cannot be used together");
        }

        PageRequest page = PageRequest.of(0, size == null ? DEFAULT_PAGE_SIZE : Math.clamp(size, 1, MAX_PAGE_SIZE));

        if(after != null)
        {
            return messageRepository.findNewer(chatId, after, page).stream()
                    .map(MessageResponse::from)
                    .toList();
        }

        return messageRepository.findLatest(chatId, before, page).reversed().stream()
                .map(MessageResponse::from)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(Integer chatId, MessageCreateRequest request, Integer userId)
    {
        Conversation conversation = findAccessibleConversation(chatId, userId);

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(userRepository.getReferenceById(userId));
        message.setContent(request.content().trim());
        messageRepository.saveAndFlush(message);
        updateReadState(conversation, userId, message.getId());

        return MessageResponse.from(message);
    }

    @Transactional
    public void markAsRead(Integer chatId, Integer userId)
    {
        Conversation conversation = findAccessibleConversation(chatId, userId);

        Integer lastMessageId = messageRepository.findLastMessageId(chatId);
        if(lastMessageId != null)
        {
            updateReadState(conversation, userId, lastMessageId);
        }
    }

    @Transactional(readOnly = true)
    public List<ChatUserResponse> getContacts(AuthenticatedUser user)
    {
        Stream<User> contacts;
        if(user.role() == UserRole.ADMIN)
        {
            contacts = conversationRepository.findClassOwners().stream();
        }
        else
        {
            List<Integer> classIds = findClassIds(user.id());
            List<User> classmates = classIds.isEmpty()
                    ? List.of()
                    : conversationRepository.findContacts(user.id(), classIds, MembershipStatus.ACCEPTED);
            List<User> admins = conversationRepository.isClassOwner(user.id())
                    ? userRepository.findAllByRoleAndIsBlocked(UserRole.ADMIN, false)
                    : List.of();

            contacts = Stream.concat(classmates.stream(), admins.stream());
        }

        return contacts
                .filter(contact -> !contact.getId().equals(user.id()))
                .collect(Collectors.toMap(User::getId, Function.identity(), (first, second) -> first, LinkedHashMap::new))
                .values().stream()
                .sorted(Comparator.comparing(User::getLastName).thenComparing(User::getFirstName))
                .map(ChatUserResponse::from)
                .toList();
    }

    private boolean canStartPrivateChat(AuthenticatedUser user, User target)
    {
        if(user.role() == UserRole.ADMIN)
        {
            return true;
        }
        if(target.getRole() == UserRole.ADMIN)
        {
            return conversationRepository.isClassOwner(user.id());
        }
        return conversationRepository.shareClass(user.id(), target.getId(), MembershipStatus.ACCEPTED);
    }

    private Conversation findAccessibleConversation(Integer chatId, Integer userId)
    {
        Conversation conversation = conversationRepository.findByIdWithDetails(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat with id " + chatId + " not found"));

        boolean hasAccess = conversation.getType() == ConversationType.CLASS
                ? findClassIds(userId).contains(conversation.getSchoolClass().getId())
                : conversation.getUserA().getId().equals(userId) || conversation.getUserB().getId().equals(userId);

        if(!hasAccess)
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this chat");
        }

        return conversation;
    }

    private List<Conversation> getOrCreateClassConversations(List<Integer> classIds)
    {
        if(classIds.isEmpty())
        {
            return List.of();
        }

        List<Conversation> conversations = new ArrayList<>(conversationRepository.findAllByClassIds(classIds));
        Set<Integer> existing = conversations.stream()
                .map(conversation -> conversation.getSchoolClass().getId())
                .collect(Collectors.toSet());

        List<Integer> missing = classIds.stream().filter(id -> !existing.contains(id)).toList();
        for(SchoolClass schoolClass : schoolClassRepository.findAllById(missing))
        {
            Conversation conversation = new Conversation();
            conversation.setType(ConversationType.CLASS);
            conversation.setSchoolClass(schoolClass);
            conversations.add(conversationRepository.save(conversation));
        }
        conversationRepository.flush();

        return conversations;
    }

    private List<ChatResponse> toResponses(Collection<Conversation> conversations, Integer userId)
    {
        if(conversations.isEmpty())
        {
            return List.of();
        }

        List<Integer> ids = conversations.stream().map(Conversation::getId).toList();
        Map<Integer, Message> lastMessages = messageRepository.findLastMessages(ids).stream()
                .collect(Collectors.toMap(message -> message.getConversation().getId(), Function.identity()));
        Map<Integer, Long> unreadCounts = messageRepository.countUnread(ids, userId).stream()
                .collect(Collectors.toMap(UnreadCount::getConversationId, UnreadCount::getCount));

        return conversations.stream()
                .map(conversation -> ChatResponse.from(
                    conversation,
                    userId,
                    lastMessages.get(conversation.getId()),
                    unreadCounts.getOrDefault(conversation.getId(), 0L)
                ))
                .toList();
    }

    private void updateReadState(Conversation conversation, Integer userId, Integer messageId)
    {
        ConversationReadState state = readStateRepository.findByConversationIdAndUserId(conversation.getId(), userId)
                .orElseGet(() -> {
                    ConversationReadState created = new ConversationReadState();
                    created.setConversation(conversation);
                    created.setUser(userRepository.getReferenceById(userId));
                    return created;
                });

        if(state.getLastReadMessageId() == null || state.getLastReadMessageId() < messageId)
        {
            state.setLastReadMessageId(messageId);
            readStateRepository.save(state);
        }
    }

    private List<Integer> findClassIds(Integer userId)
    {
        return conversationRepository.findClassIdsForMember(userId, MembershipStatus.ACCEPTED);
    }

    private static Instant lastActivity(ChatResponse chat)
    {
        return chat.lastMessage() != null ? chat.lastMessage().createdAt() : chat.createdAt();
    }
}
