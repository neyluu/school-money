package org.example.backend.core.repository;

import org.example.backend.core.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer> {
    Optional<SchoolClass> findByAccessCodeAndIsBlocked(String accessCode, Boolean isBlocked);
}
