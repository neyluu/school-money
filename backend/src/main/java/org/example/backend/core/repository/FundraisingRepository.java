package org.example.backend.core.repository;

import jakarta.persistence.LockModeType;
import org.example.backend.core.entity.Fundraising;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface FundraisingRepository extends JpaRepository<Fundraising, Integer>
{
    boolean existsBySchoolClassId(Integer classId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Fundraising f WHERE f.id = :id")
    Optional<Fundraising> findByIdForUpdate(@Param("id") Integer id);
    Optional<Fundraising> findByIdAndSchoolClassOwnerId(Integer id, Integer ownerId);

    @Query(
        value = """
            SELECT f.*
            FROM fundraisings f
                JOIN classes c ON c.id = f.class_id
            WHERE
                c.is_blocked = false
                AND f.is_blocked = false
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
                AND c.is_blocked = false
                AND f.is_blocked = false
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
                AND c.is_blocked = false
                AND f.is_blocked = false
                AND EXISTS (
                    SELECT 1
                    FROM class_memberships cm
                         JOIN children ch ON ch.id = cm.child_id
                    WHERE cm.class_id = c.id
                        AND cm.status = 'ACCEPTED'
                        AND ch.parent_id = :userId
                )
        """,
        nativeQuery = true
    )
    Optional<Fundraising> findByIdAndUserId(Integer fundraisingId, Integer userId);
}
