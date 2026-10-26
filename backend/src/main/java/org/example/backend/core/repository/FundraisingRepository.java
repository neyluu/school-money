package org.example.backend.core.repository;

import jakarta.persistence.LockModeType;
import org.example.backend.core.entity.Fundraising;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FundraisingRepository extends JpaRepository<Fundraising, Integer> {
    boolean existsBySchoolClassId(Integer classId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Fundraising f WHERE f.id = :id")
    Optional<Fundraising> findByIdForUpdate(@Param("id") Integer id);
}
