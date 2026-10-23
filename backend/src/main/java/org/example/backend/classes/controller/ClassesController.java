package org.example.backend.classes.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.classes.dto.request.ClassCreateRequest;
import org.example.backend.classes.dto.request.ClassJoinRequest;
import org.example.backend.classes.dto.request.ClassUpdateRequest;
import org.example.backend.classes.dto.response.AccessCodeResponse;
import org.example.backend.classes.dto.response.ClassLookupResponse;
import org.example.backend.classes.dto.response.ClassResponse;
import org.example.backend.classes.dto.response.ClassSummaryResponse;
import org.example.backend.classes.dto.response.MembershipResponse;
import org.example.backend.classes.dto.response.PendingMembershipResponse;
import org.example.backend.classes.service.ClassesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/classes")
@RequiredArgsConstructor
public class ClassesController
{
    private final ClassesService classesService;


    @Operation(summary = "Look up class by access code")
    @GetMapping("/lookup")
    public ResponseEntity<ClassLookupResponse> lookup(@RequestParam("code") String code)
    {
        return ResponseEntity.ok(classesService.lookup(code));
    }


    @Operation(summary = "Get classes created by user and classes of user's children")
    @GetMapping
    public ResponseEntity<List<ClassSummaryResponse>> getClasses(@AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(classesService.getAll(user.id()));
    }


    @Operation(summary = "Create class, the user becomes its owner")
    @PostMapping
    public ResponseEntity<ClassResponse> createClass(
        @Valid @RequestBody ClassCreateRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ClassResponse created = classesService.create(request, user.id());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }


    @Operation(summary = "Join class with a child by access code")
    @PostMapping("/join")
    public ResponseEntity<MembershipResponse> joinClass(
        @Valid @RequestBody ClassJoinRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        MembershipResponse membership = classesService.join(request, user.id());

        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/classes/{id}")
                .buildAndExpand(membership.classId())
                .toUri();

        return ResponseEntity.created(location).body(membership);
    }


    @Operation(summary = "Find class by id, including accepted children")
    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> getClass(@PathVariable Integer id, @AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(classesService.find(id, user.id()));
    }


    @Operation(summary = "Update class (owner only)")
    @PatchMapping("/{id}")
    public ResponseEntity<ClassResponse> updateClass(
        @PathVariable Integer id,
        @Valid @RequestBody ClassUpdateRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(classesService.update(id, request, user.id()));
    }


    @Operation(summary = "Delete class without fundraisings (owner only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Integer id, @AuthenticationPrincipal AuthenticatedUser user)
    {
        classesService.remove(id, user.id());
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "Get pending membership requests (owner only)")
    @GetMapping("/{id}/membership")
    public ResponseEntity<List<PendingMembershipResponse>> getPendingMemberships(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(classesService.getPendingMemberships(id, user.id()));
    }


    @Operation(summary = "Accept child to class (owner only)")
    @PostMapping("/{id}/membership/{childId}")
    public ResponseEntity<MembershipResponse> acceptMembership(
        @PathVariable Integer id,
        @PathVariable Integer childId,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(classesService.acceptMembership(id, childId, user.id()));
    }


    @Operation(summary = "Reject request or remove child from class (owner only)")
    @DeleteMapping("/{id}/membership/{childId}")
    public ResponseEntity<Void> removeMembership(
        @PathVariable Integer id,
        @PathVariable Integer childId,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        classesService.removeMembership(id, childId, user.id());
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "Generate new access code (owner only)")
    @PostMapping("/{id}/access-code/regenerate")
    public ResponseEntity<AccessCodeResponse> regenerateAccessCode(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(classesService.regenerateAccessCode(id, user.id()));
    }


    @Operation(summary = "Remove child from class (child's parent or owner)")
    @DeleteMapping("/{classId}/child/{childId}")
    public ResponseEntity<Void> removeChild(
        @PathVariable Integer classId,
        @PathVariable Integer childId,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        classesService.removeChild(classId, childId, user.id());
        return ResponseEntity.noContent().build();
    }
}
