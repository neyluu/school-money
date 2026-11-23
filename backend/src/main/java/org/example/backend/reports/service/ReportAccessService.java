package org.example.backend.reports.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.auth.security.AuthenticatedUser;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.entity.types.UserRole;
import org.example.backend.core.repository.ChildRepository;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.FundraisingRepository;
import org.example.backend.core.repository.SchoolClassRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReportAccessService {

    private final FundraisingRepository fundraisingRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ChildRepository childRepository;
    private final ClassMembershipRepository membershipRepository;

    public Fundraising requireFundraisingAccess(
        AuthenticatedUser user,
        Integer fundraisingId
    ) {
        Fundraising fundraising = fundraisingRepository
            .findById(fundraisingId)
            .orElseThrow(() -> notFound("Fundraising not found"));

        if (isAdmin(user)) {
            return fundraising;
        }

        Integer classId = fundraising.getSchoolClass().getId();
        boolean isOwner = fundraising
            .getSchoolClass()
            .getOwner()
            .getId()
            .equals(user.id());
        boolean isParent =
            membershipRepository.existsBySchoolClassIdAndChildParentIdAndChildActiveAndStatus(
                classId,
                user.id(),
                true,
                MembershipStatus.ACCEPTED
            );

        if (!isOwner && !isParent) {
            throw forbidden("No access to this fundraising");
        }
        return fundraising;
    }

    public Child requireChildAccess(AuthenticatedUser user, Integer childId) {
        Child child = childRepository
            .findById(childId)
            .orElseThrow(() -> notFound("Child not found"));

        if (isAdmin(user) || child.getParent().getId().equals(user.id())) {
            return child;
        }

        boolean isClassOwner = membershipRepository
            .findFirstByChildId(childId)
            .map(membership ->
                membership.getSchoolClass().getOwner().getId().equals(user.id())
            )
            .orElse(false);
        if (!isClassOwner) {
            throw forbidden("No access to this child");
        }
        return child;
    }

    public SchoolClass requireClassOwner(
        AuthenticatedUser user,
        Integer classId
    ) {
        SchoolClass schoolClass = schoolClassRepository
            .findById(classId)
            .orElseThrow(() -> notFound("Class not found"));

        if (isAdmin(user) || schoolClass.getOwner().getId().equals(user.id())) {
            return schoolClass;
        }
        throw forbidden("Only the class owner can generate this report");
    }

    private boolean isAdmin(AuthenticatedUser user) {
        return user.role() == UserRole.ADMIN;
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
