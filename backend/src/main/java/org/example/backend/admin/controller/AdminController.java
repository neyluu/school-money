package org.example.backend.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.admin.dto.request.AdminClassFilter;
import org.example.backend.admin.dto.request.AdminFundraisingFilter;
import org.example.backend.admin.dto.request.AdminUserFilter;
import org.example.backend.admin.dto.response.AdminClassResponse;
import org.example.backend.admin.dto.response.AdminFundraisingResponse;
import org.example.backend.admin.dto.response.AdminMonthlyReportResponse;
import org.example.backend.admin.dto.response.AdminStatsResponse;
import org.example.backend.admin.dto.response.AdminTreasurerResponse;
import org.example.backend.admin.dto.response.AdminUserResponse;
import org.example.backend.admin.service.AdminService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminController
{
    private final AdminService adminService;

    @Operation(
        summary = "Get all users, newest first",
        description = "Supports searching by email or name and filtering by role, blocked status, class and creation period"
    )
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers(@ParameterObject @Valid AdminUserFilter filter)
    {
        return ResponseEntity.ok(adminService.getUsers(filter));
    }


    @Operation(summary = "Get user details with classes, children, wallet balance and fundraising count")
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUser(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.getUser(id));
    }


    @Operation(
        summary = "Block user account",
        description = "Blocked user cannot log in or use any endpoint, administrator accounts cannot be blocked"
    )
    @PostMapping("/users/{id}/block")
    public ResponseEntity<AdminUserResponse> blockUser(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.blockUser(id));
    }


    @Operation(summary = "Unblock user account")
    @DeleteMapping("/users/{id}/block")
    public ResponseEntity<AdminUserResponse> unblockUser(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.unblockUser(id));
    }


    @Operation(
        summary = "Get all treasurers, newest first",
        description = "Treasurers are users owning at least one class, includes their classes, fundraising count and total collected amount"
    )
    @GetMapping("/treasurers")
    public ResponseEntity<List<AdminTreasurerResponse>> getTreasurers(@ParameterObject @Valid AdminUserFilter filter)
    {
        return ResponseEntity.ok(adminService.getTreasurers(filter));
    }


    @Operation(
        summary = "Get all classes, newest first",
        description = "Supports searching by name, school or city and filtering by blocked status and owner"
    )
    @GetMapping("/classes")
    public ResponseEntity<List<AdminClassResponse>> getClasses(@ParameterObject @Valid AdminClassFilter filter)
    {
        return ResponseEntity.ok(adminService.getClasses(filter));
    }


    @Operation(summary = "Get class details with members and fundraisings")
    @GetMapping("/classes/{id}")
    public ResponseEntity<AdminClassResponse> getClass(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.getClass(id));
    }


    @Operation(
        summary = "Block class",
        description = "Blocked class cannot be joined or modified, its fundraisings stop accepting payments and other operations"
    )
    @PostMapping("/classes/{id}/block")
    public ResponseEntity<AdminClassResponse> blockClass(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.blockClass(id));
    }


    @Operation(summary = "Unblock class")
    @DeleteMapping("/classes/{id}/block")
    public ResponseEntity<AdminClassResponse> unblockClass(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.unblockClass(id));
    }


    @Operation(
        summary = "Get all fundraisings, newest first",
        description = "Supports searching by name and filtering by status, blocked status, class and treasurer"
    )
    @GetMapping("/fundraisings")
    public ResponseEntity<List<AdminFundraisingResponse>> getFundraisings(@ParameterObject @Valid AdminFundraisingFilter filter)
    {
        return ResponseEntity.ok(adminService.getFundraisings(filter));
    }


    @Operation(summary = "Get fundraising details with wallet and payment summary")
    @GetMapping("/fundraisings/{id}")
    public ResponseEntity<AdminFundraisingResponse> getFundraising(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.getFundraising(id));
    }


    @Operation(
        summary = "Block fundraising",
        description = "Blocked fundraising stops accepting payments, withdrawals, replenishments and refunds"
    )
    @PostMapping("/fundraisings/{id}/block")
    public ResponseEntity<AdminFundraisingResponse> blockFundraising(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.blockFundraising(id));
    }


    @Operation(summary = "Unblock fundraising")
    @DeleteMapping("/fundraisings/{id}/block")
    public ResponseEntity<AdminFundraisingResponse> unblockFundraising(@PathVariable Integer id)
    {
        return ResponseEntity.ok(adminService.unblockFundraising(id));
    }


    @Operation(summary = "Get system-wide counters for the administration dashboard")
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats()
    {
        return ResponseEntity.ok(adminService.getStats());
    }


    @Operation(
        summary = "Get system-wide financial report grouped by month",
        description = """
            Turnover is the sum of completed deposits and fundraising payments, months are in UTC,
            months without activity are returned with zeros, default range is the last 6 months, max 24 months
            """
    )
    @GetMapping("/reports/summary")
    public ResponseEntity<List<AdminMonthlyReportResponse>> getMonthlySummary(
        @Parameter(description = "Report start, inclusive, default is the first day of the month 5 months ago")
        @RequestParam(required = false) Instant from,
        @Parameter(description = "Report end, exclusive, default is now")
        @RequestParam(required = false) Instant to
    )
    {
        return ResponseEntity.ok(adminService.getMonthlySummary(from, to));
    }
}