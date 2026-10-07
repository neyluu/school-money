package org.example.backend.core.repository;

import org.example.backend.core.entity.FundraisingContribution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FundraisingContributionRepository extends JpaRepository<FundraisingContribution, Integer> {
}
