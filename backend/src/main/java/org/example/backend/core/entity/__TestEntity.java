package org.example.backend.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Just for test if Hibernate works, can be deleted later

@Entity
@Table(name = "test_entity")
@Getter
@NoArgsConstructor()
public class __TestEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(name = "name", nullable = false)
    private String name;
}