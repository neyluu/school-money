package org.example.backend.children.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.children.dto.request.ChildCreateRequest;
import org.example.backend.children.dto.request.ChildUpdateRequest;
import org.example.backend.children.dto.response.ChildResponse;
import org.example.backend.children.service.ChildrenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/children")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ChildrenController
{
    private final ChildrenService childrenService;


    @Operation(summary = "Get all parent's children")
    @GetMapping
    public ResponseEntity<List<ChildResponse>> getChildren(@AuthenticationPrincipal AuthenticatedUser user)
    {
        List<ChildResponse> children = childrenService.getAll(user.id());
        if(children.isEmpty())
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(children);
    }


    @Operation(summary = "Create child")
    @PostMapping
    public ResponseEntity<ChildResponse> createChild(
        @Valid @RequestBody ChildCreateRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ChildResponse created = childrenService.create(request, user.id());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }


    @Operation(summary = "Find child by id")
    @GetMapping("/{childId}")
    public ResponseEntity<ChildResponse> getChild(
        @PathVariable Integer childId,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ChildResponse child = childrenService.find(childId, user.id());
        return ResponseEntity.ok(child);
    }

    @Operation(summary = "Update child")
    @PatchMapping("/{childId}")
    public ResponseEntity<ChildResponse> updateChild(
        @PathVariable Integer childId,
        @Valid @RequestBody ChildUpdateRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ChildResponse child = childrenService.update(childId, user.id(), request);
        return ResponseEntity.ok(child);
    }

    @DeleteMapping("/{childId}")
    public ResponseEntity<?> deleteChild(@PathVariable Integer childId)
    {
        return null;
    }

    @GetMapping("/{childId}/avatar")
    public ResponseEntity<?> getAvatar(@PathVariable Integer childId)
    {
        return null;
    }

    @PutMapping("/{childId}/avatar")
    public ResponseEntity<?> putAvatar(@PathVariable Integer childId)
    {
        return null;
    }

    @DeleteMapping("/{childId}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable Integer childId)
    {
        return null;
    }
}
