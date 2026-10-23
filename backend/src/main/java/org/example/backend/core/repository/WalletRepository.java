package org.example.backend.core.repository;

import org.example.backend.core.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Integer>
{
    Optional<Wallet> findByUserId(Integer id);
    Optional<Wallet> findByFundraisingId(Integer id);
}
