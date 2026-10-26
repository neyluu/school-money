package org.example.backend.payments.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.NotImplementedException;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.payments.dto.request.DepositRequest;
import org.example.backend.payments.dto.request.FundraisePaymentRequest;
import org.example.backend.payments.dto.request.FundraiseReplenishRequest;
import org.example.backend.payments.dto.request.FundraiseWithdrawRequest;
import org.example.backend.payments.dto.request.WithdrawRequest;
import org.example.backend.payments.dto.response.ContributionResponse;
import org.example.backend.payments.dto.response.FundraisingTransferResponse;
import org.example.backend.payments.dto.response.RefundSummaryResponse;
import org.example.backend.payments.dto.response.TransactionResponse;
import org.example.backend.payments.dto.response.WalletResponse;
import org.example.backend.payments.service.FundraisingFundsService;
import org.example.backend.payments.service.FundraisingPaymentsService;
import org.example.backend.payments.service.FundraisingRefundService;
import org.example.backend.payments.service.PaymentsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PaymentsController
{
    private final PaymentsService paymentsService;
    private final FundraisingPaymentsService fundraisingPaymentsService;
    private final FundraisingFundsService fundraisingFundsService;
    private final FundraisingRefundService fundraisingRefundService;

    @Operation(summary = "Get personal wallet information")
    @GetMapping("/wallet")
    public ResponseEntity<WalletResponse> getWallet(@AuthenticationPrincipal AuthenticatedUser user)
    {
        return ResponseEntity.ok(
            paymentsService.getWallet(user.id())
        );
    }


    @Operation(summary = "Get all transactions related to wallet, newest first")
    @GetMapping("/wallet/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactions(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Parameter(description = "Page number starting from 0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size, default 20, max 100")
        @RequestParam(defaultValue = "20") int size
    )
    {
        return ResponseEntity.ok(paymentsService.getTransactions(user.id(), page, size));
    }


    @Operation(summary = "Get contributions from fundraises")
    @GetMapping("/wallet/contributions")
    public ResponseEntity<?> getContributions(@AuthenticationPrincipal AuthenticatedUser user)
    {
        throw new NotImplementedException();
    }


    @Operation(summary = "Deposit money on personal wallet")
    @PostMapping("/wallet/deposits")
    public ResponseEntity<TransactionResponse> deposit(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody DepositRequest request
    )
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentsService.deposit(user.id(), request));
    }


    @Operation(summary = "Withdraw money from personal wallet to external account")
    @PostMapping("/wallet/withdrawals")
    public ResponseEntity<TransactionResponse> withdraw(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody WithdrawRequest request
    )
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentsService.withdraw(user.id(), request));
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
        return ResponseEntity.ok(fundraisingPaymentsService.getWallet(id, user.id()));
    }


    @Operation(
        summary = "Withdraw money from fundraise wallet to personal wallet",
        description = "Only class owner can withdraw, fundraising must be active and not blocked"
    )
    @PostMapping("/fundraisings/{id}/withdrawals")
    public ResponseEntity<FundraisingTransferResponse> withdrawFromFundraising(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody FundraiseWithdrawRequest request
    )
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(fundraisingFundsService.withdraw(id, user.id(), request));
    }


    @Operation(summary = "Get all fundraise withdraws, newest first")
    @GetMapping("/fundraisings/{id}/withdrawals")
    public ResponseEntity<List<FundraisingTransferResponse>> getAllFundraiseWithdraws(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Parameter(description = "Page number starting from 0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size, default 20, max 100")
        @RequestParam(defaultValue = "20") int size
    )
    {
        return ResponseEntity.ok(fundraisingFundsService.getWithdrawals(id, user.id(), page, size));
    }


    @Operation(
        summary = "Return previously withdrawn money to fundraise wallet",
        description = "Only class owner can replenish, total replenished amount cannot exceed total withdrawn amount"
    )
    @PostMapping("/fundraisings/{id}/replenishments")
    public ResponseEntity<FundraisingTransferResponse> replenishFundraising(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody FundraiseReplenishRequest request
    )
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(fundraisingFundsService.replenish(id, user.id(), request));
    }


    @Operation(summary = "Get all fundraise replenishments, newest first")
    @GetMapping("/fundraisings/{id}/replenishments")
    public ResponseEntity<List<FundraisingTransferResponse>> getAllFundraiseReplenishments(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Parameter(description = "Page number starting from 0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size, default 20, max 100")
        @RequestParam(defaultValue = "20") int size
    )
    {
        return ResponseEntity.ok(fundraisingFundsService.getReplenishments(id, user.id(), page, size));
    }


    @Operation(
        summary = "Close fundraise and refund all payments to payers",
        description = "Only class owner can close, wallet of fundraising must contain all contributed money, so previously withdrawn money has to be replenished first"
    )
    @PostMapping("/fundraisings/{id}/refunds")
    public ResponseEntity<RefundSummaryResponse> refundFundraise(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user
    )
    {
        return ResponseEntity.ok(fundraisingRefundService.refund(id, user.id()));
    }


    @Operation(
        summary = "Pay on a fundraise",
        description = "Payer can pay for any accepted child of the class and can pay in parts, total paid for a child cannot exceed amount per child"
    )
    @PostMapping("/fundraisings/{id}/contributions")
    public ResponseEntity<ContributionResponse> payForFundraise(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody FundraisePaymentRequest request
    )
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(fundraisingPaymentsService.pay(id, user.id(), request));
    }


    @Operation(summary = "Get all fundraise contributions, newest first")
    @GetMapping("/fundraisings/{id}/contributions")
    public ResponseEntity<List<ContributionResponse>> getFundraiseContributions(
        @PathVariable Integer id,
        @AuthenticationPrincipal AuthenticatedUser user,
        @Parameter(description = "Page number starting from 0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size, default 20, max 100")
        @RequestParam(defaultValue = "20") int size
    )
    {
        return ResponseEntity.ok(fundraisingPaymentsService.getContributions(id, user.id(), page, size));
    }
}
