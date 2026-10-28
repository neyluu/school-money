package org.example.backend.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.payments.dto.response.FundraisingChildResponse;
import org.example.backend.payments.dto.response.FundraisingInvoiceResponse;
import org.example.backend.payments.dto.response.FundraisingSummaryResponse;
import org.example.backend.payments.service.FundraisingInvoiceService;
import org.example.backend.payments.service.FundraisingOverviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/payments/fundraisings/{id}")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class FundraisingDetailsController
{
    private final FundraisingOverviewService overviewService;
    private final FundraisingInvoiceService invoiceService;

    @Operation(
        summary = "Get fundraising summary with money statistics",
        description = "Available for the class owner and parents of accepted children"
    )
    @GetMapping
    public ResponseEntity<FundraisingSummaryResponse> getSummary(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        return ResponseEntity.ok(overviewService.getSummary(id, user.id()));
    }


    @Operation(
        summary = "Get accepted children of the class with their payment status for the fundraising",
        description = "Used to choose the child to pay for, isMine marks children of the current user"
    )
    @GetMapping("/children")
    public ResponseEntity<List<FundraisingChildResponse>> getChildren(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        return ResponseEntity.ok(overviewService.getChildren(id, user.id()));
    }


    @Operation(summary = "Get fundraising invoices, newest first")
    @GetMapping("/invoices")
    public ResponseEntity<List<FundraisingInvoiceResponse>> getInvoices(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        return ResponseEntity.ok(invoiceService.getAll(id, user.id()));
    }


    @Operation(
        summary = "Add invoice to fundraising (class owner only)",
        description = "PNG, JPEG and PDF files are accepted, title is optional and has at most 100 characters"
    )
    @PostMapping(value = "/invoices", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FundraisingInvoiceResponse> addInvoice(
        @PathVariable Integer id,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "title", required = false) String title,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.add(id, user.id(), title, file));
    }


    @Operation(summary = "Get invoice file")
    @GetMapping("/invoices/{invoiceId}/file")
    public ResponseEntity<byte[]> getInvoiceFile(
        @PathVariable Integer id,
        @PathVariable Integer invoiceId,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        return invoiceService.getFile(id, invoiceId, user.id());
    }
}
