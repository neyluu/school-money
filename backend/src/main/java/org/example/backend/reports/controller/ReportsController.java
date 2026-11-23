package org.example.backend.reports.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.reports.dto.ReportFormat;
import org.example.backend.reports.dto.ReportResult;
import org.example.backend.reports.service.ReportsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReportsController {

    private final ReportsService reportsService;

    @Operation(
        summary = "Generate a financial report for a fundraising",
        description = "Available for the class owner, parents of accepted children and administrators. Dates are inclusive, in UTC."
    )
    @GetMapping("/fundraisings/{id}")
    public ResponseEntity<byte[]> fundraising(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer id,
        @Parameter(description = "PDF or CSV") @RequestParam(
            defaultValue = "PDF"
        ) ReportFormat format,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE
        ) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE
        ) LocalDate to
    ) {
        return toResponse(
            reportsService.fundraising(user, id, format, from, to),
            "zbiorka-" + id
        );
    }

    @Operation(
        summary = "Generate a financial report for a child",
        description = "Available for the child's parent, the class owner and administrators."
    )
    @GetMapping("/children/{id}")
    public ResponseEntity<byte[]> child(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer id,
        @Parameter(description = "PDF or CSV") @RequestParam(
            defaultValue = "PDF"
        ) ReportFormat format,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE
        ) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE
        ) LocalDate to
    ) {
        return toResponse(
            reportsService.child(user, id, format, from, to),
            "dziecko-" + id
        );
    }

    @Operation(
        summary = "Generate a financial report for a class",
        description = "Available for the class owner and administrators."
    )
    @GetMapping("/classes/{id}")
    public ResponseEntity<byte[]> schoolClass(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer id,
        @Parameter(description = "PDF or CSV") @RequestParam(
            defaultValue = "PDF"
        ) ReportFormat format,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE
        ) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE
        ) LocalDate to
    ) {
        return toResponse(
            reportsService.schoolClass(user, id, format, from, to),
            "klasa-" + id
        );
    }

    private ResponseEntity<byte[]> toResponse(
        ReportResult result,
        String baseName
    ) {
        return ResponseEntity.ok()
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" +
                    baseName +
                    "." +
                    result.extension() +
                    "\""
            )
            .contentType(result.mediaType())
            .body(result.content());
    }
}
