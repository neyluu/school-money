package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.FundraisingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class FundraisingAccessService
{
    private final FundraisingRepository fundraisingRepository;
    private final ClassMembershipRepository membershipRepository;

    public Fundraising find(Integer fundraisingId)
    {
        return fundraisingRepository.findById(fundraisingId)
                .orElseThrow(() -> notFound(fundraisingId));
    }

    public Fundraising findForUpdate(Integer fundraisingId)
    {
        return fundraisingRepository.findByIdForUpdate(fundraisingId)
                .orElseThrow(() -> notFound(fundraisingId));
    }

    public void requireClassAccess(Fundraising fundraising, Integer userId)
    {
        SchoolClass schoolClass = fundraising.getSchoolClass();

        boolean hasAcceptedChild = membershipRepository.existsBySchoolClassIdAndChildParentIdAndChildActiveAndStatus(
            schoolClass.getId(), userId, true, MembershipStatus.ACCEPTED
        );

        if(!isOwner(fundraising, userId) && !hasAcceptedChild)
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this fundraising");
        }
    }

    public void requireOwner(Fundraising fundraising, Integer userId)
    {
        if(!isOwner(fundraising, userId))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the class owner can perform this action");
        }
    }

    public void requireNotBlocked(Fundraising fundraising)
    {
        if(fundraising.getIsBlocked() || fundraising.getSchoolClass().getIsBlocked())
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Fundraising is blocked");
        }
    }

    public void requireActive(Fundraising fundraising)
    {
        if(fundraising.getStatus() != FundraisingStatus.ACTIVE)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Fundraising is not active");
        }
    }

    private boolean isOwner(Fundraising fundraising, Integer userId)
    {
        return fundraising.getSchoolClass().getOwner().getId().equals(userId);
    }

    private ResponseStatusException notFound(Integer fundraisingId)
    {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising with id " + fundraisingId + " not found");
    }
}
