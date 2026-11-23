package org.example.backend.payments.repository;

import java.util.List;
import java.util.Optional;
import org.example.backend.payments.entity.SavedAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedAccountRepository
    extends JpaRepository<SavedAccount, Integer>
{
    List<SavedAccount> findAllByUserIdOrderByRecipientNameAsc(Integer userId);

    Optional<SavedAccount> findByIdAndUserId(Integer id, Integer userId);

    boolean existsByUserIdAndIban(Integer userId, String iban);
}
