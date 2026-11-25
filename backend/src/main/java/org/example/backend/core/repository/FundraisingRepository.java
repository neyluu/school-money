package org.example.backend.core.repository;

import jakarta.persistence.LockModeType;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.List;

public interface FundraisingRepository extends JpaRepository<Fundraising, Integer>, JpaSpecificationExecutor<Fundraising>
{
    boolean existsBySchoolClassId(Integer classId);
    long countByIsBlocked(Boolean isBlocked);

    @Query("""
        SELECT COUNT(f)
        FROM Fundraising f
        WHERE f.isBlocked = false
            AND f.schoolClass.isBlocked = true
        """)
    long countByBlockedClassOnly();

    @Query("""
        SELECT COUNT(f)
        FROM Fundraising f
        WHERE f.status = :status
            AND f.isBlocked = false
            AND f.schoolClass.isBlocked = false
        """)
    long countByStatusAndNotBlocked(@Param("status") FundraisingStatus status);

    List<Fundraising> findAllBySchoolClassId(Integer classId);
    List<Fundraising> findAllBySchoolClassOwnerIdIn(Collection<Integer> ownerIds);

    @Override
    @EntityGraph(attributePaths = {"schoolClass", "schoolClass.owner"})
    List<Fundraising> findAll(Specification<Fundraising> specification, Sort sort);

    @Query("""
        SELECT f.schoolClass.id AS classId, COUNT(f) AS count
        FROM Fundraising f
        WHERE f.schoolClass.id IN :classIds
        GROUP BY f.schoolClass.id
        """)
    List<ClassFundraisingCount> countBySchoolClassIds(@Param("classIds") Collection<Integer> classIds);

    @Query("""
        SELECT f.schoolClass.owner.id AS ownerId, COUNT(f) AS count
        FROM Fundraising f
        WHERE f.schoolClass.owner.id IN :ownerIds
        GROUP BY f.schoolClass.owner.id
        """)
    List<OwnerFundraisingCount> countByOwnerIds(@Param("ownerIds") Collection<Integer> ownerIds);

    @Query(
        value = """
            SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*) AS count
            FROM fundraisings
            WHERE created_at >= :from AND created_at < :to
            GROUP BY 1
            ORDER BY 1
        """,
        nativeQuery = true
    )
    List<MonthlyCount> countNewByMonth(@Param("from") Instant from, @Param("to") Instant to);

    interface ClassFundraisingCount {
        Integer getClassId();
        Long getCount();
    }

    interface OwnerFundraisingCount {
        Integer getOwnerId();
        Long getCount();
    }

    interface MonthlyCount {
        String getMonth();
        Long getCount();
    }

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Fundraising f WHERE f.id = :id")
    Optional<Fundraising> findByIdForUpdate(@Param("id") Integer id);
    Optional<Fundraising> findByIdAndSchoolClassOwnerId(Integer id, Integer ownerId);

    List<Fundraising> findAllBySchoolClassIdInAndStatusAndIsBlocked(
        Collection<Integer> classIds,
        FundraisingStatus status,
        Boolean isBlocked
    );

    List<Fundraising> findAllBySchoolClassOwnerIdOrderByCreatedAtDesc(Integer ownerId);

    @Query(
        value = """
            SELECT f.*
            FROM fundraisings f
                JOIN classes c ON c.id = f.class_id
            WHERE
                (
                    c.owner_id = :userId
                    OR EXISTS (
                        SELECT 1
                        FROM class_memberships cm
                            JOIN children ch ON ch.id = cm.child_id
                        WHERE cm.class_id = c.id
                            AND cm.status = 'ACCEPTED'
                            AND ch.parent_id = :userId
                    )
                )
            ORDER BY f.created_at DESC
        """,
        nativeQuery = true
    )
    List<Fundraising> findAllByUserId(Integer userId);

    @Query(
        value = """
            SELECT f.*
            FROM fundraisings f
                JOIN classes c ON c.id = f.class_id
            WHERE 
                c.id = :classId
                AND (
                    c.owner_id = :userId
                    OR EXISTS (
                        SELECT 1
                        FROM class_memberships cm
                            JOIN children ch ON ch.id = cm.child_id
                        WHERE cm.class_id = c.id
                            AND cm.status = 'ACCEPTED'
                            AND ch.parent_id = :userId
                    )
                )
            ORDER BY f.created_at DESC
        """,
        nativeQuery = true)
    List<Fundraising> findAllByUserIdAndClassId(Integer userId, Integer classId);

    @Query(
        value = """
            SELECT f.*
            FROM fundraisings f
                 JOIN classes c ON c.id = f.class_id
            WHERE
                f.id = :fundraisingId
                AND (
                    c.owner_id = :userId
                    OR EXISTS (
                        SELECT 1
                        FROM class_memberships cm
                             JOIN children ch ON ch.id = cm.child_id
                        WHERE cm.class_id = c.id
                            AND cm.status = 'ACCEPTED'
                            AND ch.parent_id = :userId
                    )
                )
        """,
        nativeQuery = true
    )
    Optional<Fundraising> findByIdAndUserId(Integer fundraisingId, Integer userId);

    long countByStatus(FundraisingStatus status);
}
