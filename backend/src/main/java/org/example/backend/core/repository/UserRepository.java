package org.example.backend.core.repository;

import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findAllByRoleAndIsBlocked(UserRole role, Boolean isBlocked);
}
