package org.example.backend.payments.service;

import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.User;
import org.example.backend.core.repository.UserRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.request.SavedAccountCreateRequest;
import org.example.backend.payments.dto.response.SavedAccountResponse;
import org.example.backend.payments.entity.SavedAccount;
import org.example.backend.payments.repository.SavedAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SavedAccountService {

    private final SavedAccountRepository savedAccountRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SavedAccountResponse> getAll(Integer userId) {
        return savedAccountRepository
            .findAllByUserIdOrderByRecipientNameAsc(userId)
            .stream()
            .map(SavedAccountResponse::from)
            .toList();
    }

    @Transactional
    public SavedAccountResponse add(
        Integer userId,
        SavedAccountCreateRequest request
    ) {
        String iban = request.iban().toUpperCase(Locale.ROOT);

        if (walletRepository.existsByIban(iban)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only external accounts can be saved"
            );
        }
        if (savedAccountRepository.existsByUserIdAndIban(userId, iban)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This account is already saved"
            );
        }

        SavedAccount account = new SavedAccount();
        account.setUser(userRepository.getReferenceById(userId));
        account.setRecipientName(request.recipientName().trim());
        account.setIban(iban);

        return SavedAccountResponse.from(savedAccountRepository.save(account));
    }

    @Transactional
    public void remove(Integer userId, Integer accountId) {
        SavedAccount account = savedAccountRepository
            .findByIdAndUserId(accountId, userId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Saved account not found"
                )
            );
        savedAccountRepository.delete(account);
    }

    @Transactional(readOnly = true)
    public SavedAccount findOwned(Integer userId, Integer accountId) {
        return savedAccountRepository
            .findByIdAndUserId(accountId, userId)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Saved account not found"
                )
            );
    }
}
