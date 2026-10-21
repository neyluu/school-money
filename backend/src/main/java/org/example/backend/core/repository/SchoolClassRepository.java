package org.example.backend.core.repository;

import org.example.backend.core.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer> {
    Optional<SchoolClass> findByAccessCodeAndIsBlocked(String accessCode, Boolean isBlocked);

    boolean existsByAccessCode(String accessCode);

    @Query("SELECT c FROM SchoolClass c JOIN FETCH c.owner WHERE c.id = :id")
    Optional<SchoolClass> findByIdWithOwner(@Param("id") Integer id);

    @Query("""
        SELECT c FROM SchoolClass c JOIN FETCH c.owner
        WHERE c.owner.id = :userId
           OR EXISTS (
               SELECT m.id FROM ClassMembership m
               WHERE m.schoolClass = c AND m.child.parent.id = :userId AND m.child.active = true
           )
        ORDER BY c.createdAt DESC
        """)
    List<SchoolClass> findAllForUser(@Param("userId") Integer userId);
}
