package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.exception.WalletCreationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class WalletCreationService
{
    private final static int MAX_IBAN_ATTEMPTS = 10;
    private final static String DIGITS = "0123456789";
    private final static int IBAN_LEN = 26;
    private final static SecureRandom random = new SecureRandom();

    private final WalletRepository walletRepository;

    public void createWallet(User user)
    {
        createWallet(user, null);
    }

    public void createWallet(Fundraising fundraising)
    {
        createWallet(null, fundraising);
    }

    private void createWallet(User user, Fundraising fundraising)
    {
        if((user == null && fundraising == null) || (user != null && fundraising != null))
        {
            throw new IllegalArgumentException("Exactly one of parameters must be null");
        }

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setFundraising(fundraising);
        wallet.setBalance(BigDecimal.ZERO);

        for(int i = 0; i < MAX_IBAN_ATTEMPTS; i++)
        {
            String iban = createIban();
            wallet.setIban(iban);
            try
            {
                walletRepository.saveAndFlush(wallet);
                return;
            }
            catch(DataIntegrityViolationException _) { /* Next Iban generation */ }
        }

        throw new WalletCreationException("Failed to generate unique IBAN");

    }

    private String createIban()
    {
        StringBuilder sb = new StringBuilder(26);
        sb.append("PL");

        for(int i = 0; i < IBAN_LEN; i++)
        {
            sb.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        }

        return sb.toString();
    }
}
