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

    @Query("SELECT w.id FROM Wallet w WHERE w.user.id = :userId")
    Optional<Integer> findIdByUserId(@Param("userId") Integer userId);

    @Query("SELECT w.id FROM Wallet w WHERE w.fundraising.id = :fundraisingId")
    Optional<Integer> findIdByFundraisingId(@Param("fundraisingId") Integer fundraisingId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :id")
    Optional<Wallet> findByIdForUpdate(@Param("id") Integer id);
}
