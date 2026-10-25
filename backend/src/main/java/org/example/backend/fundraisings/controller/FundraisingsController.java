package org.example.backend.fundraisings.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.NotImplementedException;
import org.example.backend.auth.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fundraisings")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class FundraisingsController
{
    @Operation(
        summary = "Create new fundraise, creator became fundraise OWNER",
        description = """
            Only owner of class can create new fundraise
        """
    )
    @PostMapping
    public ResponseEntity<?> createFundraise(@AuthenticationPrincipal AuthenticatedUser user)
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Find all fundraisings that belongs to given class")
    @GetMapping
    public ResponseEntity<?> findFundraisings(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam Integer classId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Find fundraise by id")
    @GetMapping("/{fundraiseId}")
    public ResponseEntity<?> getFundraise(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Update a fundraise [OWNER ONLY]")
    @PatchMapping("/{fundraiseId}")
    public ResponseEntity<?> updateFundraise(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(
        summary = "Close a fundraise [OWNER ONLY]",
        description = """
            Closing a fundraise requires all money to be withdraw from fundraise wallet
            or fundraise to be refunded
        """
    )
    @PostMapping("/{fundraiseId}/close")
    public ResponseEntity<?> closeFundraise(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Refund all contributions to given fundraise [OWNER ONLY]")
    @PostMapping("/{fundraiseId}/refund")
    public ResponseEntity<?> refundFundraise(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Upload fundraise logo [OWNER ONLY]")
    @PutMapping("/{fundraiseId}/logo")
    public ResponseEntity<?> uploadLogo(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Remove fundraise logo [OWNER ONLY]")
    @DeleteMapping("/{fundraiseId}/logo")
    public ResponseEntity<?> deleteLogo(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Get all contributions for given fundraise")
    @GetMapping("/{fundraiseId}/contributions")
    public ResponseEntity<?> getContributions(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Get all invoices from given fundraise")
    @GetMapping("/{fundraiseId}/invoices")
    public ResponseEntity<?> getInvoices(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }

    @Operation(summary = "Upload an invoice [OWNER ONLY]")
    @PostMapping("/{fundraiseId}/invoices")
    public ResponseEntity<?> uploadInvoice(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable Integer fundraiseId
    )
    {
        throw new NotImplementedException();
    }


    /*
    * TODO Endpoints below is disabled for now to simplify application
    * Can be enabled later if we decide to add updating and removing invoices
    * But this need some kind of history to keep track of all operations on every invoice
    * */
//    @Operation(summary = "Update invoice [OWNER ONLY]")
//    @PatchMapping("/{fundraiseId}/invoices/{invoiceId}")
//    public ResponseEntity<?> updateInvoice(
//        @AuthenticationPrincipal AuthenticatedUser user,
//        @PathVariable Integer fundraiseId,
//        @PathVariable Integer invoiceId
//    )
//    {
//        throw new NotImplementedException();
//    }
//
//    @Operation(summary = "Mark invoice as canceled without deleting it [OWNER ONLY]")
//    @PostMapping("/{fundraiseId}/invoices/{invoiceId}/void")
//    public ResponseEntity<?> cancelInvoice(
//        @AuthenticationPrincipal AuthenticatedUser user,
//        @PathVariable Integer fundraiseId,
//        @PathVariable Integer invoiceId
//    )
//    {
//        throw new NotImplementedException();
//    }
//
//    @Operation(summary = "Get history of invoices")
//    @GetMapping("/{fundraiseId}/invoices")
//    public ResponseEntity<?> getInvoicesHistory(
//        @AuthenticationPrincipal AuthenticatedUser user,
//        @PathVariable Integer fundraiseId
//    )
//    {
//        throw new NotImplementedException();
//    }


}
