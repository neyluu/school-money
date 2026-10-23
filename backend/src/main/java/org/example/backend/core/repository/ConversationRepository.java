package org.example.backend.core.repository;

import org.example.backend.core.entity.Conversation;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Integer> {
    @Query("""
        SELECT c FROM Conversation c
        LEFT JOIN FETCH c.schoolClass
        LEFT JOIN FETCH c.userA
        LEFT JOIN FETCH c.userB
        WHERE c.id = :id
        """)
    Optional<Conversation> findByIdWithDetails(@Param("id") Integer id);

    @Query("SELECT c FROM Conversation c JOIN FETCH c.schoolClass WHERE c.schoolClass.id IN :classIds")
    List<Conversation> findAllByClassIds(@Param("classIds") Collection<Integer> classIds);

    @Query("""
        SELECT c FROM Conversation c
        JOIN FETCH c.userA
        JOIN FETCH c.userB
        WHERE c.userA.id = :userId OR c.userB.id = :userId
        """)
    List<Conversation> findAllPrivateForUser(@Param("userId") Integer userId);

    @Query("SELECT c FROM Conversation c WHERE c.userA.id = :userAId AND c.userB.id = :userBId")
    Optional<Conversation> findPrivate(@Param("userAId") Integer userAId, @Param("userBId") Integer userBId);

    @Query("""
        SELECT sc.id FROM SchoolClass sc
        WHERE sc.owner.id = :userId
           OR EXISTS (
               SELECT m.id FROM ClassMembership m
               WHERE m.schoolClass = sc AND m.status = :accepted
                 AND m.child.active = true AND m.child.parent.id = :userId
           )
        """)
    List<Integer> findClassIdsForMember(@Param("userId") Integer userId, @Param("accepted") MembershipStatus accepted);

    @Query("""
        SELECT CASE WHEN COUNT(sc) > 0 THEN true ELSE false END FROM SchoolClass sc
        WHERE (sc.owner.id = :userAId OR EXISTS (
                  SELECT m.id FROM ClassMembership m
                  WHERE m.schoolClass = sc AND m.status = :accepted
                    AND m.child.active = true AND m.child.parent.id = :userAId))
          AND (sc.owner.id = :userBId OR EXISTS (
                  SELECT m.id FROM ClassMembership m
                  WHERE m.schoolClass = sc AND m.status = :accepted
                    AND m.child.active = true AND m.child.parent.id = :userBId))
        """)
    boolean shareClass(
        @Param("userAId") Integer userAId,
        @Param("userBId") Integer userBId,
        @Param("accepted") MembershipStatus accepted
    );

    @Query("SELECT CASE WHEN COUNT(sc) > 0 THEN true ELSE false END FROM SchoolClass sc WHERE sc.owner.id = :userId")
    boolean isClassOwner(@Param("userId") Integer userId);

    @Query("SELECT DISTINCT sc.owner FROM SchoolClass sc WHERE sc.owner.isBlocked = false")
    List<User> findClassOwners();

    @Query("""
        SELECT u FROM User u
        WHERE u.id <> :userId AND u.isBlocked = false
          AND (EXISTS (SELECT sc.id FROM SchoolClass sc WHERE sc.id IN :classIds AND sc.owner = u)
            OR EXISTS (
                SELECT m.id FROM ClassMembership m
                WHERE m.schoolClass.id IN :classIds AND m.status = :accepted
                  AND m.child.active = true AND m.child.parent = u))
        ORDER BY u.lastName, u.firstName
        """)
    List<User> findContacts(
        @Param("userId") Integer userId,
        @Param("classIds") Collection<Integer> classIds,
        @Param("accepted") MembershipStatus accepted
    );
}
