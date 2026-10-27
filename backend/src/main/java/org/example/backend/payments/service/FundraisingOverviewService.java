package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.FundraisingContributionRepository.ChildPaidAmount;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.response.FundraisingChildResponse;
import org.example.backend.payments.dto.response.FundraisingSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FundraisingOverviewService
{
    private final FundraisingAccessService accessService;
    private final FundraisingContributionRepository contributionRepository;
    private final ClassMembershipRepository membershipRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public FundraisingSummaryResponse getSummary(Integer fundraisingId, Integer userId)
    {
        Fundraising fundraising = accessService.find(fundraisingId);
        accessService.requireClassAccess(fundraising, userId);

        Integer walletId = walletRepository.findIdByFundraisingId(fundraisingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising wallet not found"));
        BigDecimal balance = walletRepository.findBalanceByFundraisingId(fundraisingId)
                .orElse(BigDecimal.ZERO);
        BigDecimal collected = contributionRepository.sumActiveAmountByFundraisingId(fundraisingId)
                .orElse(BigDecimal.ZERO);
        BigDecimal withdrawn = sumTransfers(walletId, TransactionType.PAYOUT)
                .subtract(sumTransfers(walletId, TransactionType.REPLENISHMENT));

        List<FundraisingChildResponse> children = findChildren(fundraising, userId);
        int paidChildren = (int) children.stream().filter(FundraisingChildResponse::isPaid).count();

        return new FundraisingSummaryResponse(
            fundraising.getId(),
            fundraising.getName(),
            fundraising.getDescription(),
            fundraising.getStartAt(),
            fundraising.getEndAt(),
            fundraising.getAmountPerChild(),
            fundraising.getStatus(),
            fundraising.getIsBlocked(),
            fundraising.getSchoolClass().getId(),
            fundraising.getSchoolClass().getName(),
            fundraising.getSchoolClass().getOwner().getId().equals(userId),
            balance,
            collected,
            withdrawn,
            paidChildren,
            children.size()
        );
    }

    @Transactional(readOnly = true)
    public List<FundraisingChildResponse> getChildren(Integer fundraisingId, Integer userId)
    {
        Fundraising fundraising = accessService.find(fundraisingId);
        accessService.requireClassAccess(fundraising, userId);

        return findChildren(fundraising, userId);
    }

    private List<FundraisingChildResponse> findChildren(Fundraising fundraising, Integer userId)
    {
        Map<Integer, BigDecimal> paidByChild = contributionRepository.sumActiveAmountsByChild(fundraising.getId()).stream()
                .collect(Collectors.toMap(ChildPaidAmount::getChildId, ChildPaidAmount::getAmount));

        return membershipRepository.findAllByClassIdAndStatus(fundraising.getSchoolClass().getId(), MembershipStatus.ACCEPTED).stream()
                .map(ClassMembership::getChild)
                .map(child -> FundraisingChildResponse.from(
                    child,
                    child.getParent().getId().equals(userId),
                    paidByChild.getOrDefault(child.getId(), BigDecimal.ZERO),
                    fundraising.getAmountPerChild()
                ))
                .toList();
    }

    private BigDecimal sumTransfers(Integer walletId, TransactionType type)
    {
        return transactionRepository.sumByWalletIdAndType(walletId, type).orElse(BigDecimal.ZERO);
    }
}
