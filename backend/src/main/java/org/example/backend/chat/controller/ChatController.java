package org.example.backend.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.chat.dto.request.MessageCreateRequest;
import org.example.backend.chat.dto.request.PrivateChatRequest;
import org.example.backend.chat.dto.response.ChatResponse;
import org.example.backend.chat.dto.response.ChatUserResponse;
import org.example.backend.chat.dto.response.MessageResponse;
import org.example.backend.chat.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController
{
    private final ChatService chatService;


    @Operation(summary = "Get user's chats (class and private), most recently active first")
    @GetMapping
    public ResponseEntity<List<ChatResponse>> getChats(@AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(chatService.getAll(user.id()));
    }


    @Operation(summary = "Get users the current user can start a private chat with")
    @GetMapping("/contacts")
    public ResponseEntity<List<ChatUserResponse>> getContacts(@AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(chatService.getContacts(user));
    }


    @Operation(summary = "Get class chat (class owner and parents of accepted children)")
    @GetMapping("/class/{classId}")
    public ResponseEntity<ChatResponse> getClassChat(@PathVariable Integer classId, @AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(chatService.getClassChat(classId, user.id()));
    }


    @Operation(summary = "Get or start private chat with a user")
    @PostMapping("/private")
    public ResponseEntity<ChatResponse> getOrCreatePrivateChat(
        @Valid @RequestBody PrivateChatRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(chatService.getOrCreatePrivateChat(request.userId(), user));
    }


    @Operation(summary = "Find chat by id")
    @GetMapping("/{chatId}")
    public ResponseEntity<ChatResponse> getChat(@PathVariable Integer chatId, @AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(chatService.find(chatId, user.id()));
    }


    @Operation(summary = "Get chat messages, ordered from the oldest to the newest")
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
        @PathVariable Integer chatId,
        @Parameter(description = "Load messages older than this message id (history)")
        @RequestParam(required = false) Integer before,
        @Parameter(description = "Load messages newer than this message id (polling for new messages)")
        @RequestParam(required = false) Integer after,
        @Parameter(description = "Number of messages, default 50, max 100")
        @RequestParam(required = false) Integer size,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(chatService.getMessages(chatId, user.id(), before, after, size));
    }


    @Operation(summary = "Send message")
    @PostMapping("/{chatId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
        @PathVariable Integer chatId,
        @Valid @RequestBody MessageCreateRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.sendMessage(chatId, request, user.id()));
    }


    @Operation(summary = "Mark all chat messages as read")
    @PostMapping("/{chatId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Integer chatId, @AuthenticationPrincipal AuthenticatedUser user)
    {
        chatService.markAsRead(chatId, user.id());
        return ResponseEntity.noContent().build();
    }
}
