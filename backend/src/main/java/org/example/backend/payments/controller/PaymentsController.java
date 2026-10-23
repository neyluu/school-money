package org.example.backend.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.NotImplementedException;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.payments.dto.request.DepositRequest;
import org.example.backend.payments.dto.request.FundraisePaymentRequest;
import org.example.backend.payments.dto.request.FundraiseWithdrawRequest;
import org.example.backend.payments.dto.request.WithdrawRequest;
import org.example.backend.payments.dto.response.WalletResponse;
import org.example.backend.payments.service.PaymentsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PaymentsController
{
    private final PaymentsService paymentsService;

    @Operation(summary = "Get personal wallet information")
    @GetMapping("/wallet")
    public ResponseEntity<WalletResponse> getWallet(@AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(
            paymentsService.getWallet(user.id())
        );
    }


    @Operation(summary = "Get all transactions related to wallet")
    @GetMapping("/wallet/transactions")
    public ResponseEntity<?> getTransactions(@AuthenticationPrincipal AuthenticatedUser user)
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Get contributions from fundraises")
    @GetMapping("/wallet/contributions")
    public ResponseEntity<?> getContributions(@AuthenticationPrincipal AuthenticatedUser user)
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Deposit money on personal wallet")
    @PostMapping("/wallet/deposits")
    public ResponseEntity<?> deposit(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody DepositRequest request
    )
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Withdraw money from personal wallet")
    @PostMapping("/wallet/withdrawals")
    public ResponseEntity<?> withdraw(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody WithdrawRequest request
    )
    {
        throw new NotImplementedException();
    }


    @Operation(
        summary = "Get wallet of fundraising",
        description = "All users whose children are in class in which fundraise got created have access to this endpoint"
    )
    @GetMapping("/fundraisings/{id}/wallet")
    public ResponseEntity<WalletResponse> getFundraisingWallet(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Withdraw money from fundraise wallet to personal wallet")
    @PostMapping("/fundraisings/{id}/withdrawals")
    public ResponseEntity<?> withdrawFromFundraising(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody FundraiseWithdrawRequest request
    )
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Get all fundraise withdraws")
    @GetMapping("/fundraisings/{id}/withdrawals")
    public ResponseEntity<?> getAllFundraiseWithdraws(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Refund all payments from fundraise")
    @PostMapping("/fundraisings/{id}/refunds")
    public ResponseEntity<?> refundFundraise(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Pay on a fundraise")
    @PostMapping("/fundraisings/{id}/contributions")
    public ResponseEntity<?> payForFundraise(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody FundraisePaymentRequest request
    )
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Get all fundraise contributions")
    @GetMapping("/fundraisings/{id}/contributions")
    public ResponseEntity<?> getFundraiseContributions(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        throw new NotImplementedException();
    }
}
