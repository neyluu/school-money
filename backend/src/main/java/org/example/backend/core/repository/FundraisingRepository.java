package org.example.backend.core.repository;

import org.example.backend.core.entity.Fundraising;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FundraisingRepository extends JpaRepository<Fundraising, Integer>
{
    boolean existsBySchoolClassId(Integer classId);

    @Query(
            value = """
            SELECT DISTINCT f.*
            FROM fundraisings f
                 JOIN classes c             ON c.id = f.class_id
                 JOIN class_memberships cm  ON cm.class_id = c.id
                 JOIN children ch           ON ch.id = cm.child_id
            WHERE
                ch.parent_id = :userId
                AND cm.status = 'ACCEPTED'
                AND c.is_blocked = false
                AND f.is_blocked = false
        """,
            nativeQuery = true
    )
    List<Fundraising> findAllByUserId(Integer userId);

    @Query(
            value = """
            SELECT DISTINCT f.*
            FROM fundraisings f
                 JOIN classes c             ON c.id = f.class_id
                 JOIN class_memberships cm  ON cm.class_id = c.id
                 JOIN children ch           ON ch.id = cm.child_id
            WHERE
                ch.parent_id = :userId
                AND c.id = :classId
                AND cm.status = 'ACCEPTED'
                AND c.is_blocked = false
                AND f.is_blocked = false
        """,
            nativeQuery = true
    )
    List<Fundraising> findAllByUserIdAndClassId(Integer userId, Integer classId);
}
