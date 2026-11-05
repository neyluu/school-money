package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.ClassMembershipRepository.ClassMembershipCount;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.FundraisingContributionRepository.FundraisingChildPaidAmount;
import org.example.backend.core.repository.FundraisingRepository;
import org.example.backend.core.repository.WalletRepository;
import org.example.backend.payments.dto.response.ContributionPersonResponse;
import org.example.backend.payments.dto.response.DueResponse;
import org.example.backend.payments.dto.response.OwnedFundraisingResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService
{
    private final ClassMembershipRepository membershipRepository;
    private final FundraisingRepository fundraisingRepository;
    private final FundraisingContributionRepository contributionRepository;
    private final WalletRepository walletRepository;
    private final FundraisingAccessService accessService;

    private record PaidKey(Integer fundraisingId, Integer childId) {}

    @Transactional(readOnly = true)
    public List<DueResponse> getDues(Integer userId)
    {
        List<ClassMembership> memberships = membershipRepository.findAllByParentId(userId).stream()
                .filter(membership -> membership.getStatus() == MembershipStatus.ACCEPTED)
                .toList();
        if(memberships.isEmpty())
        {
            return List.of();
        }

        Map<Integer, List<Child>> childrenByClass = memberships.stream()
                .collect(Collectors.groupingBy(
                    membership -> membership.getSchoolClass().getId(),
                    Collectors.mapping(ClassMembership::getChild, Collectors.toList())
                ));

        List<Fundraising> fundraisings = fundraisingRepository
                .findAllBySchoolClassIdInAndStatusAndIsBlocked(childrenByClass.keySet(), FundraisingStatus.ACTIVE, false).stream()
                .filter(fundraising -> !fundraising.getSchoolClass().getIsBlocked())
                .filter(fundraising -> !accessService.hasEnded(fundraising))
                .sorted(Comparator.comparing(Fundraising::getEndAt))
                .toList();
        if(fundraisings.isEmpty())
        {
            return List.of();
        }

        List<Integer> childIds = memberships.stream().map(membership -> membership.getChild().getId()).toList();
        Map<PaidKey, BigDecimal> paid = contributionRepository.sumActiveAmountsByChildIds(childIds).stream()
                .collect(Collectors.toMap(
                    amount -> new PaidKey(amount.getFundraisingId(), amount.getChildId()),
                    FundraisingChildPaidAmount::getAmount
                ));

        List<DueResponse> dues = new ArrayList<>();
        for(Fundraising fundraising : fundraisings)
        {
            for(Child child : childrenByClass.get(fundraising.getSchoolClass().getId()))
            {
                BigDecimal paidAmount = paid.getOrDefault(new PaidKey(fundraising.getId(), child.getId()), BigDecimal.ZERO);
                BigDecimal remaining = fundraising.getAmountPerChild().subtract(paidAmount);

                if(remaining.signum() > 0)
                {
                    dues.add(new DueResponse(
                        fundraising.getId(),
                        fundraising.getName(),
                        fundraising.getEndAt(),
                        ContributionPersonResponse.from(child),
                        fundraising.getAmountPerChild(),
                        paidAmount,
                        remaining
                    ));
                }
            }
        }

        return dues;
    }

    @Transactional(readOnly = true)
    public List<OwnedFundraisingResponse> getOwnedFundraisings(Integer userId)
    {
        List<Fundraising> fundraisings = fundraisingRepository.findAllBySchoolClassOwnerIdOrderByCreatedAtDesc(userId);
        if(fundraisings.isEmpty())
        {
            return List.of();
        }

        List<Integer> fundraisingIds = fundraisings.stream().map(Fundraising::getId).toList();
        List<Integer> classIds = fundraisings.stream().map(fundraising -> fundraising.getSchoolClass().getId()).distinct().toList();

        Map<Integer, Wallet> wallets = walletRepository.findAllByFundraisingIdIn(fundraisingIds).stream()
                .collect(Collectors.toMap(wallet -> wallet.getFundraising().getId(), Function.identity()));
        Map<Integer, Long> childrenCounts = membershipRepository
                .countByClassIdsAndStatus(classIds, MembershipStatus.ACCEPTED).stream()
                .collect(Collectors.toMap(ClassMembershipCount::getClassId, ClassMembershipCount::getCount));
        Map<Integer, List<FundraisingChildPaidAmount>> paidByFundraising = contributionRepository
                .sumActiveAmountsByFundraisingIds(fundraisingIds).stream()
                .collect(Collectors.groupingBy(FundraisingChildPaidAmount::getFundraisingId));

        return fundraisings.stream()
                .map(fundraising -> toOwnedResponse(fundraising, wallets, childrenCounts, paidByFundraising))
                .toList();
    }

    private OwnedFundraisingResponse toOwnedResponse(
        Fundraising fundraising,
        Map<Integer, Wallet> wallets,
        Map<Integer, Long> childrenCounts,
        Map<Integer, List<FundraisingChildPaidAmount>> paidByFundraising
    )
    {
        Wallet wallet = wallets.get(fundraising.getId());
        List<FundraisingChildPaidAmount> paid = paidByFundraising.getOrDefault(fundraising.getId(), List.of());
        int totalChildren = childrenCounts.getOrDefault(fundraising.getSchoolClass().getId(), 0L).intValue();

        BigDecimal collected = paid.stream()
                .map(FundraisingChildPaidAmount::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int paidChildren = (int) paid.stream()
                .filter(amount -> amount.getAmount().compareTo(fundraising.getAmountPerChild()) >= 0)
                .count();

        return new OwnedFundraisingResponse(
            fundraising.getId(),
            fundraising.getName(),
            fundraising.getStatus(),
            fundraising.getIsBlocked(),
            fundraising.getEndAt(),
            fundraising.getAmountPerChild(),
            wallet != null ? wallet.getIban() : null,
            wallet != null ? wallet.getBalance() : BigDecimal.ZERO,
            collected,
            Math.min(paidChildren, totalChildren),
            totalChildren
        );
    }
}
