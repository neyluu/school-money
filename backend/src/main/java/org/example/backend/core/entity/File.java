package org.example.backend.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "files")
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "filename", nullable = false, length = Integer.MAX_VALUE)
    private String filename;

    @NotNull
    @Column(name = "content_type", nullable = false, length = Integer.MAX_VALUE)
    private String contentType;

    @NotNull
    @Column(name = "size_bytes", nullable = false)
    private Integer sizeBytes;

    @NotNull
    @Column(name = "data", nullable = false)
    private byte[] data;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;


}