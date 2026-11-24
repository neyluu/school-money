package org.example.backend.core.repository;

import org.example.backend.core.entity.SchoolClass;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer>, JpaSpecificationExecutor<SchoolClass> {
    Optional<SchoolClass> findByAccessCodeAndIsBlockedAndDeletedAtIsNull(String accessCode, Boolean isBlocked);

    boolean existsByAccessCode(String accessCode);
    boolean existsByIdAndDeletedAtIsNull(Integer id);
    long countByIsBlockedAndDeletedAtIsNull(Boolean isBlocked);

    @Query("SELECT COUNT(DISTINCT c.owner.id) FROM SchoolClass c WHERE c.deletedAt IS NULL")
    long countDistinctOwners();

    List<SchoolClass> findAllByOwnerIdAndDeletedAtIsNull(Integer ownerId);
    List<SchoolClass> findAllByOwnerIdInAndDeletedAtIsNull(Collection<Integer> ownerIds);

    @Override
    @EntityGraph(attributePaths = {"owner"})
    List<SchoolClass> findAll(Specification<SchoolClass> specification, Sort sort);

    boolean existsByOwnerIdAndDeletedAtIsNull(Integer ownerId);

    @Query("SELECT c FROM SchoolClass c JOIN FETCH c.owner WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<SchoolClass> findByIdWithOwner(@Param("id") Integer id);

    @Query("SELECT c FROM SchoolClass c JOIN FETCH c.owner WHERE c.id = :id")
    Optional<SchoolClass> findByIdWithOwnerIncludingDeleted(@Param("id") Integer id);

    @Query("""
        SELECT c FROM SchoolClass c JOIN FETCH c.owner
        WHERE (c.owner.id = :userId AND c.deletedAt IS NULL)
           OR EXISTS (
               SELECT m.id FROM ClassMembership m
               WHERE m.schoolClass = c AND m.child.parent.id = :userId AND m.child.active = true
           )
        ORDER BY c.createdAt DESC
        """)
    List<SchoolClass> findAllForUser(@Param("userId") Integer userId);
}