package org.example.backend.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.example.backend.core.entity.types.TransactionStatus;
import org.example.backend.core.entity.types.TransactionType;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "from_wallet_id")
    private Wallet fromWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "to_wallet_id")
    private Wallet toWallet;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, columnDefinition = "transaction_type")
    private TransactionType TransactionType;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Column(name = "title", nullable = false, length = Integer.MAX_VALUE)
    private String title;

    @NotNull
    @Enumerated(EnumType.STRING)
    @ColumnDefault("'pending'")
    @Column(name = "status", nullable = false, columnDefinition = "transaction_status")
    private TransactionStatus status;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;


}