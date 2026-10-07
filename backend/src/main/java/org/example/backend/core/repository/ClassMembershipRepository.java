package org.example.backend.core.repository;

import org.example.backend.core.entity.ClassMembership;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassMembershipRepository extends JpaRepository<ClassMembership, Integer> {
}
