package org.example.backend.core.repository;

import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.types.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ClassMembershipRepository extends JpaRepository<ClassMembership, Integer> {
    boolean existsByChildIdAndStatusIn(Integer childId, Collection<MembershipStatus> statuses);

    boolean existsBySchoolClassIdAndChildParentIdAndChildActiveAndStatus(
        Integer classId,
        Integer parentId,
        Boolean active,
        MembershipStatus status
    );

    @Query("""
        SELECT m FROM ClassMembership m
        JOIN FETCH m.child c
        JOIN FETCH c.parent
        WHERE m.schoolClass.id = :classId AND c.id = :childId AND c.active = true AND m.status IN :statuses
        """)
    Optional<ClassMembership> findByClassIdAndChildId(
        @Param("classId") Integer classId,
        @Param("childId") Integer childId,
        @Param("statuses") Collection<MembershipStatus> statuses
    );

    @Query("""
        SELECT m FROM ClassMembership m
        JOIN FETCH m.child c
        JOIN FETCH c.parent
        WHERE m.schoolClass.id = :classId AND m.status = :status AND c.active = true
        ORDER BY c.lastName, c.firstName
        """)
    List<ClassMembership> findAllByClassIdAndStatus(@Param("classId") Integer classId, @Param("status") MembershipStatus status);

    @Query("""
        SELECT m FROM ClassMembership m
        JOIN FETCH m.child c
        WHERE c.parent.id = :parentId AND c.active = true
        """)
    List<ClassMembership> findAllByParentId(@Param("parentId") Integer parentId);

    @Query("""
        SELECT m.schoolClass.id AS classId, COUNT(m) AS count FROM ClassMembership m
        WHERE m.schoolClass.id IN :classIds AND m.status = :status AND m.child.active = true
        GROUP BY m.schoolClass.id
        """)
    List<ClassMembershipCount> countByClassIdsAndStatus(
        @Param("classIds") Collection<Integer> classIds,
        @Param("status") MembershipStatus status
    );

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE ClassMembership m SET m.status = :newStatus, m.decidedAt = :decidedAt
        WHERE m.schoolClass.id = :classId AND m.status IN :statuses
        """)
    void updateStatusByClassId(
        @Param("classId") Integer classId,
        @Param("statuses") Collection<MembershipStatus> statuses,
        @Param("newStatus") MembershipStatus newStatus,
        @Param("decidedAt") Instant decidedAt
    );

    interface ClassMembershipCount {
        Integer getClassId();

        Long getCount();
    }
}
