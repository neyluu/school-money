package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.FundraisingRepository;
import org.example.backend.core.repository.UserRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.request.FundraisePaymentRequest;
import org.example.backend.payments.dto.response.ContributionResponse;
import org.example.backend.payments.dto.response.WalletResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FundraisingPaymentsService
{
    private static final int MAX_PAGE_SIZE = 100;
    private static final String CONTRIBUTION_TITLE_PREFIX = "Contribution to fundraising ";

    private final FundraisingRepository fundraisingRepository;
    private final FundraisingContributionRepository contributionRepository;
    private final ClassMembershipRepository membershipRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final LedgerService ledgerService;

    @Transactional(readOnly = true)
    public WalletResponse getWallet(Integer fundraisingId, Integer userId)
    {
        Fundraising fundraising = findFundraising(fundraisingId);
        requireClassAccess(fundraising, userId);

        Wallet wallet = walletRepository.findByFundraisingId(fundraisingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));

        return WalletResponse.from(wallet);
    }

    @Transactional(readOnly = true)
    public List<ContributionResponse> getContributions(Integer fundraisingId, Integer userId, int page, int size)
    {
        Fundraising fundraising = findFundraising(fundraisingId);
        requireClassAccess(fundraising, userId);

        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE));

        return contributionRepository.findAllByFundraisingId(fundraisingId, pageRequest).stream()
                .map(ContributionResponse::from)
                .toList();
    }

    @Transactional
    public ContributionResponse pay(Integer fundraisingId, Integer userId, FundraisePaymentRequest request)
    {
        Fundraising fundraising = fundraisingRepository.findByIdForUpdate(fundraisingId)
                .orElseThrow(() -> notFound(fundraisingId));
        requireClassAccess(fundraising, userId);
        requireOpenForPayments(fundraising);

        Child child = findAcceptedChild(fundraising.getSchoolClass().getId(), request.childId());
        requireWithinRemainingAmount(fundraising, child, request.amount());

        Integer payerWalletId = walletRepository.findIdByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));
        Integer fundraisingWalletId = walletRepository.findIdByFundraisingId(fundraisingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising wallet not found"));

        Transaction transaction = ledgerService.transfer(
            payerWalletId,
            fundraisingWalletId,
            request.amount(),
            TransactionType.PAYMENT,
            CONTRIBUTION_TITLE_PREFIX + fundraising.getName()
        );

        FundraisingContribution contribution = new FundraisingContribution();
        contribution.setFundraising(fundraising);
        contribution.setPayer(userRepository.getReferenceById(userId));
        contribution.setChild(child);
        contribution.setTransaction(transaction);
        contributionRepository.save(contribution);

        return ContributionResponse.from(contribution);
    }

    private Fundraising findFundraising(Integer fundraisingId)
    {
        return fundraisingRepository.findById(fundraisingId)
                .orElseThrow(() -> notFound(fundraisingId));
    }

    private ResponseStatusException notFound(Integer fundraisingId)
    {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising with id " + fundraisingId + " not found");
    }

    private void requireClassAccess(Fundraising fundraising, Integer userId)
    {
        SchoolClass schoolClass = fundraising.getSchoolClass();

        boolean isOwner = schoolClass.getOwner().getId().equals(userId);
        boolean hasAcceptedChild = membershipRepository.existsBySchoolClassIdAndChildParentIdAndChildActiveAndStatus(
            schoolClass.getId(), userId, true, MembershipStatus.ACCEPTED
        );

        if(!isOwner && !hasAcceptedChild)
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this fundraising");
        }
    }

    private void requireOpenForPayments(Fundraising fundraising)
    {
        if(fundraising.getIsBlocked() || fundraising.getSchoolClass().getIsBlocked())
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Fundraising is blocked");
        }

        Instant now = Instant.now();
        boolean isOpen = fundraising.getStatus() == FundraisingStatus.ACTIVE
                && !now.isBefore(fundraising.getStartAt())
                && now.isBefore(fundraising.getEndAt());

        if(!isOpen)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Fundraising is not open for payments");
        }
    }

    private Child findAcceptedChild(Integer classId, Integer childId)
    {
        return membershipRepository.findByClassIdAndChildId(classId, childId)
                .filter(membership -> membership.getStatus() == MembershipStatus.ACCEPTED)
                .map(ClassMembership::getChild)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Child is not an accepted member of this class"));
    }

    private void requireWithinRemainingAmount(Fundraising fundraising, Child child, BigDecimal amount)
    {
        BigDecimal paid = contributionRepository.sumActiveAmount(fundraising.getId(), child.getId())
                .orElse(BigDecimal.ZERO);
        BigDecimal remaining = fundraising.getAmountPerChild().subtract(paid);

        if(remaining.signum() <= 0)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Child has already paid for this fundraising");
        }
        if(amount.compareTo(remaining) > 0)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount exceeds remaining amount " + remaining.toPlainString());
        }
    }
}
