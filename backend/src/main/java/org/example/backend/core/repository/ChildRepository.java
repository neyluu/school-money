package org.example.backend.core.repository;

import org.example.backend.core.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildRepository extends JpaRepository<Child, Integer> {
    List<Child> findByParentId(Integer parentId);
    List<Child> findByParentIdAndActive(Integer parentId, Boolean active);
    Optional<Child> findByIdAndParentId(Integer childId, Integer parentId);
    Optional<Child> findByIdAndParentIdAndActive(Integer childId, Integer parentId, Boolean active);
}
