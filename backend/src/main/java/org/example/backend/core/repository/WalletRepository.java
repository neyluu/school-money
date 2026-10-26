package org.example.backend.core.repository;

import jakarta.persistence.LockModeType;
import org.example.backend.core.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Integer>
{
    Optional<Wallet> findByUserId(Integer id);
    Optional<Wallet> findByFundraisingId(Integer id);
    boolean existsByIban(String iban);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :id")
    Optional<Wallet> findByIdForUpdate(@Param("id") Integer id);
}
