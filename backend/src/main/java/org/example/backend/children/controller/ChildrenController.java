package org.example.backend.children.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.children.dto.ChildRequest;
import org.example.backend.children.dto.ChildResponse;
import org.example.backend.children.service.ChildrenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/children")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ChildrenController
{
    private final ChildrenService childrenService;

    @GetMapping
    public ResponseEntity<?> getChildren()
    {
        return null;
    }

    @PostMapping
    public ResponseEntity<ChildResponse> createChild(
            @RequestBody ChildRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ChildResponse created = childrenService.create(request, user.id());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{childId}")
    public ResponseEntity<?> getChild(@PathVariable Integer childId)
    {
        return null;
    }

    @PatchMapping("/{childId}")
    public ResponseEntity<?> updateChild(@PathVariable Integer childId, @RequestBody ChildRequest request)
    {
        return null;
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
