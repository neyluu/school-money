package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.repository.*;
import org.example.backend.payments.dto.response.WalletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PaymentsService
{
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final FundraisingRepository fundraisingRepository;
    private final FundraisingContributionRepository fundraisingContributionRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public WalletResponse getWallet(Integer userId)
    {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));

        return WalletResponse.from(wallet);
    }
}
