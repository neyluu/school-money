package org.example.backend.core.repository;

import org.example.backend.core.entity.__TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

// Just for test if Hibernate works, can be deleted later

public interface __TestEntityRepository extends JpaRepository<__TestEntity, Long>
{
}
