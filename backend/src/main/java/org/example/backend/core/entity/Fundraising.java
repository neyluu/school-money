package org.example.backend.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "fundraisings")
public class Fundraising {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "logo_file_id")
    private File logoFile;

    @NotNull
    @Column(name = "name", nullable = false, length = Integer.MAX_VALUE)
    private String name;

    @NotNull
    @Column(name = "description", nullable = false, length = Integer.MAX_VALUE)
    private String description;

    @NotNull
    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @NotNull
    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @NotNull
    @Column(name = "amount_per_child", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPerChild;

    @NotNull
    @Enumerated(EnumType.STRING)
    @ColumnDefault("'active'")
    @Column(name = "status", nullable = false, columnDefinition = "fundraising_status")
    private FundraisingStatus status;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @NotNull
    @ColumnDefault("false")
    @Column(name = "is_blocked", nullable = false)
    private Boolean isBlocked;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


}