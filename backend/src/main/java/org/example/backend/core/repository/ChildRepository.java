package org.example.backend.core.repository;

import org.example.backend.core.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Integer> {
    List<Child> findByParentId(Integer parentId);
}
