package org.example.backend.core.repository;

import org.example.backend.core.entity.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    @Query("""
        SELECT t FROM Transaction t
        WHERE t.fromWallet.id = :walletId OR t.toWallet.id = :walletId
        ORDER BY t.id DESC
        """)
    List<Transaction> findAllByWalletId(@Param("walletId") Integer walletId, Pageable pageable);
}
