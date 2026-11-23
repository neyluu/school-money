package org.example.backend.admin.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.admin.dto.request.AdminClassFilter;
import org.example.backend.admin.dto.request.AdminFundraisingFilter;
import org.example.backend.admin.dto.request.AdminUserFilter;
import org.example.backend.admin.dto.response.AdminClassResponse;
import org.example.backend.admin.dto.response.AdminFundraisingResponse;
import org.example.backend.admin.dto.response.AdminMonthlyReportResponse;
import org.example.backend.admin.dto.response.AdminStatsResponse;
import org.example.backend.admin.dto.response.AdminTreasurerResponse;
import org.example.backend.admin.dto.response.AdminUserResponse;
import org.example.backend.admin.utils.AdminSpecifications;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.entity.types.UserRole;
import org.example.backend.core.repository.ChildRepository;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.ClassMembershipRepository.ClassMembershipCount;
import org.example.backend.core.repository.FundraisingContributionRepository;
import org.example.backend.core.repository.FundraisingContributionRepository.FundraisingPaidAmount;
import org.example.backend.core.repository.FundraisingRepository;
import org.example.backend.core.repository.FundraisingRepository.ClassFundraisingCount;
import org.example.backend.core.repository.FundraisingRepository.OwnerFundraisingCount;
import org.example.backend.core.repository.SchoolClassRepository;
import org.example.backend.core.repository.TransactionRepository;
import org.example.backend.core.repository.UserRepository;
import org.example.backend.core.repository.WalletRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService
{
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "id");
    private static final int DEFAULT_REPORT_MONTHS = 6;
    private static final int MAX_REPORT_MONTHS = 24;

    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ClassMembershipRepository membershipRepository;
    private final FundraisingRepository fundraisingRepository;
    private final FundraisingContributionRepository contributionRepository;
    private final ChildRepository childRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(AdminUserFilter filter)
    {
        List<User> users = userRepository.findAll(AdminSpecifications.users(filter), NEWEST_FIRST);
        Map<Integer, List<SchoolClass>> classesByUser = findClassesByUser(users);

        return users.stream()
                .map(user -> AdminUserResponse.from(user, classesByUser.getOrDefault(user.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(Integer userId)
    {
        User user = findUser(userId);

        List<SchoolClass> classes = findClassesByUser(List.of(user)).getOrDefault(userId, List.of());
        List<Child> children = childRepository.findByParentId(userId);
        BigDecimal walletBalance = walletRepository.findByUserId(userId)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
        long fundraisingCount = fundraisingRepository.countByOwnerIds(List.of(userId)).stream()
                .findFirst()
                .map(OwnerFundraisingCount::getCount)
                .orElse(0L);

        return AdminUserResponse.details(user, classes, children, walletBalance, fundraisingCount);
    }

    @Transactional
    public AdminUserResponse blockUser(Integer userId)
    {
        return setUserBlocked(userId, true);
    }

    @Transactional
    public AdminUserResponse unblockUser(Integer userId)
    {
        return setUserBlocked(userId, false);
    }

    @Transactional(readOnly = true)
    public List<AdminTreasurerResponse> getTreasurers(AdminUserFilter filter)
    {
        List<User> treasurers = userRepository.findAll(AdminSpecifications.treasurers(filter), NEWEST_FIRST);
        if(treasurers.isEmpty())
        {
            return List.of();
        }

        List<Integer> ids = treasurers.stream().map(User::getId).toList();

        Map<Integer, List<SchoolClass>> classesByOwner = schoolClassRepository
                .findAllByOwnerIdInAndDeletedAtIsNull(ids).stream()
                .collect(Collectors.groupingBy(schoolClass -> schoolClass.getOwner().getId()));

        Map<Integer, Long> fundraisingCounts = fundraisingRepository.countByOwnerIds(ids).stream()
                .collect(Collectors.toMap(OwnerFundraisingCount::getOwnerId, OwnerFundraisingCount::getCount));

        Map<Integer, BigDecimal> collectedByOwner = findCollectedByOwner(ids);

        return treasurers.stream()
                .map(treasurer -> AdminTreasurerResponse.from(
                    treasurer,
                    classesByOwner.getOrDefault(treasurer.getId(), List.of()),
                    fundraisingCounts.getOrDefault(treasurer.getId(), 0L),
                    collectedByOwner.getOrDefault(treasurer.getId(), BigDecimal.ZERO)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminClassResponse> getClasses(AdminClassFilter filter)
    {
        List<SchoolClass> classes = schoolClassRepository.findAll(AdminSpecifications.classes(filter), NEWEST_FIRST);
        if(classes.isEmpty())
        {
            return List.of();
        }

        List<Integer> classIds = classes.stream().map(SchoolClass::getId).toList();

        Map<Integer, Long> memberCounts = membershipRepository
                .countByClassIdsAndStatus(classIds, MembershipStatus.ACCEPTED).stream()
                .collect(Collectors.toMap(ClassMembershipCount::getClassId, ClassMembershipCount::getCount));
        Map<Integer, Long> fundraisingCounts = fundraisingRepository.countBySchoolClassIds(classIds).stream()
                .collect(Collectors.toMap(ClassFundraisingCount::getClassId, ClassFundraisingCount::getCount));

        return classes.stream()
                .map(schoolClass -> AdminClassResponse.from(
                    schoolClass,
                    memberCounts.getOrDefault(schoolClass.getId(), 0L),
                    fundraisingCounts.getOrDefault(schoolClass.getId(), 0L)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminClassResponse getClass(Integer classId)
    {
        SchoolClass schoolClass = findClassIncludingDeleted(classId);

        List<ClassMembership> members = membershipRepository.findAllByClassIdAndStatus(classId, MembershipStatus.ACCEPTED);
        List<AdminFundraisingResponse> fundraisings = toFundraisingResponses(fundraisingRepository.findAllBySchoolClassId(classId));

        return AdminClassResponse.details(schoolClass, members, fundraisings);
    }

    @Transactional
    public AdminClassResponse blockClass(Integer classId)
    {
        return setClassBlocked(classId, true);
    }

    @Transactional
    public AdminClassResponse unblockClass(Integer classId)
    {
        return setClassBlocked(classId, false);
    }

    @Transactional(readOnly = true)
    public List<AdminFundraisingResponse> getFundraisings(AdminFundraisingFilter filter)
    {
        return toFundraisingResponses(fundraisingRepository.findAll(AdminSpecifications.fundraisings(filter), NEWEST_FIRST));
    }

    @Transactional(readOnly = true)
    public AdminFundraisingResponse getFundraising(Integer fundraisingId)
    {
        Fundraising fundraising = findFundraising(fundraisingId);

        long childrenCount = membershipRepository
                .countByClassIdsAndStatus(List.of(fundraising.getSchoolClass().getId()), MembershipStatus.ACCEPTED).stream()
                .findFirst()
                .map(ClassMembershipCount::getCount)
                .orElse(0L);
        long paidChildrenCount = contributionRepository.sumActiveAmountsByChild(fundraisingId).stream()
                .filter(paid -> paid.getAmount().compareTo(fundraising.getAmountPerChild()) >= 0)
                .count();

        return AdminFundraisingResponse.details(
            fundraising,
            collectedAmount(fundraisingId),
            walletBalance(fundraisingId),
            childrenCount,
            paidChildrenCount
        );
    }

    @Transactional
    public AdminFundraisingResponse blockFundraising(Integer fundraisingId)
    {
        return setFundraisingBlocked(fundraisingId, true);
    }

    @Transactional
    public AdminFundraisingResponse unblockFundraising(Integer fundraisingId)
    {
        return setFundraisingBlocked(fundraisingId, false);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats()
    {
        return new AdminStatsResponse(
            userRepository.count(),
            schoolClassRepository.countDistinctOwners(),
            fundraisingRepository.countByStatusAndIsBlocked(FundraisingStatus.ACTIVE, false),
            userRepository.countByIsBlocked(true),
            schoolClassRepository.countByIsBlockedAndDeletedAtIsNull(true),
            fundraisingRepository.countByIsBlocked(true)
        );
    }

    @Transactional(readOnly = true)
    public List<AdminMonthlyReportResponse> getMonthlySummary(Instant from, Instant to)
    {
        Instant end = to == null ? Instant.now() : to;
        Instant start = from == null
                ? YearMonth.now(ZoneOffset.UTC).minusMonths(DEFAULT_REPORT_MONTHS - 1L).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC)
                : from;

        if(!start.isBefore(end))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parameter from must be before to");
        }

        YearMonth startMonth = YearMonth.from(start.atZone(ZoneOffset.UTC));
        YearMonth endMonth = YearMonth.from(end.atZone(ZoneOffset.UTC));

        if(startMonth.plusMonths(MAX_REPORT_MONTHS).isBefore(endMonth))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report range cannot exceed " + MAX_REPORT_MONTHS + " months");
        }

        Map<String, Long> newUsers = userRepository.countNewByMonth(start, end).stream()
                .collect(Collectors.toMap(UserRepository.MonthlyCount::getMonth, UserRepository.MonthlyCount::getCount));
        Map<String, Long> newFundraisings = fundraisingRepository.countNewByMonth(start, end).stream()
                .collect(Collectors.toMap(FundraisingRepository.MonthlyCount::getMonth, FundraisingRepository.MonthlyCount::getCount));
        Map<String, BigDecimal> turnover = transactionRepository.turnoverByMonth(start, end).stream()
                .collect(Collectors.toMap(TransactionRepository.MonthlyTurnover::getMonth, TransactionRepository.MonthlyTurnover::getTurnover));

        List<AdminMonthlyReportResponse> months = new ArrayList<>();
        for(YearMonth month = startMonth; !month.isAfter(endMonth); month = month.plusMonths(1))
        {
            String key = month.toString();
            months.add(new AdminMonthlyReportResponse(
                month,
                newUsers.getOrDefault(key, 0L),
                newFundraisings.getOrDefault(key, 0L),
                turnover.getOrDefault(key, BigDecimal.ZERO)
            ));
        }

        return months;
    }

    private AdminUserResponse setUserBlocked(Integer userId, boolean blocked)
    {
        User user = findUser(userId);

        if(user.getRole() == UserRole.ADMIN)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Administrator accounts cannot be blocked");
        }

        user.setIsBlocked(blocked);
        user.setUpdatedAt(Instant.now());
        userRepository.saveAndFlush(user);

        List<SchoolClass> classes = findClassesByUser(List.of(user)).getOrDefault(userId, List.of());
        return AdminUserResponse.from(user, classes);
    }

    private AdminClassResponse setClassBlocked(Integer classId, boolean blocked)
    {
        SchoolClass schoolClass = findClassIncludingDeleted(classId);

        if(schoolClass.getDeletedAt() != null)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Class is deleted and cannot be blocked or unblocked");
        }

        schoolClass.setIsBlocked(blocked);
        schoolClassRepository.saveAndFlush(schoolClass);

        long memberCount = membershipRepository
                .countByClassIdsAndStatus(List.of(classId), MembershipStatus.ACCEPTED).stream()
                .findFirst()
                .map(ClassMembershipCount::getCount)
                .orElse(0L);
        long fundraisingCount = fundraisingRepository.countBySchoolClassIds(List.of(classId)).stream()
                .findFirst()
                .map(ClassFundraisingCount::getCount)
                .orElse(0L);

        return AdminClassResponse.from(schoolClass, memberCount, fundraisingCount);
    }

    private AdminFundraisingResponse setFundraisingBlocked(Integer fundraisingId, boolean blocked)
    {
        Fundraising fundraising = findFundraising(fundraisingId);

        fundraising.setIsBlocked(blocked);
        fundraisingRepository.saveAndFlush(fundraising);

        return AdminFundraisingResponse.from(fundraising, collectedAmount(fundraisingId), walletBalance(fundraisingId));
    }

    private Map<Integer, BigDecimal> findCollectedByOwner(List<Integer> ownerIds)
    {
        List<Fundraising> fundraisings = fundraisingRepository.findAllBySchoolClassOwnerIdIn(ownerIds);
        if(fundraisings.isEmpty())
        {
            return Map.of();
        }

        List<Integer> fundraisingIds = fundraisings.stream().map(Fundraising::getId).toList();
        Map<Integer, BigDecimal> collectedByFundraising = contributionRepository
                .sumActiveAmountsByFundraisingIdIn(fundraisingIds).stream()
                .collect(Collectors.toMap(FundraisingPaidAmount::getFundraisingId, FundraisingPaidAmount::getAmount));

        return fundraisings.stream()
                .collect(Collectors.groupingBy(
                    fundraising -> fundraising.getSchoolClass().getOwner().getId(),
                    Collectors.reducing(
                        BigDecimal.ZERO,
                        fundraising -> collectedByFundraising.getOrDefault(fundraising.getId(), BigDecimal.ZERO),
                        BigDecimal::add
                    )
                ));
    }

    private Map<Integer, List<SchoolClass>> findClassesByUser(List<User> users)
    {
        if(users.isEmpty())
        {
            return Map.of();
        }

        List<Integer> ids = users.stream().map(User::getId).toList();

        Map<Integer, Map<Integer, SchoolClass>> classesByUser = new LinkedHashMap<>();

        for(SchoolClass schoolClass : schoolClassRepository.findAllByOwnerIdInAndDeletedAtIsNull(ids))
        {
            classesByUser
                    .computeIfAbsent(schoolClass.getOwner().getId(), key -> new LinkedHashMap<>())
                    .put(schoolClass.getId(), schoolClass);
        }

        for(ClassMembership membership : membershipRepository.findAllByParentIdsAndStatus(ids, MembershipStatus.ACCEPTED))
        {
            SchoolClass schoolClass = membership.getSchoolClass();
            classesByUser
                    .computeIfAbsent(membership.getChild().getParent().getId(), key -> new LinkedHashMap<>())
                    .put(schoolClass.getId(), schoolClass);
        }

        return classesByUser.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().values().stream()
                            .sorted(Comparator.comparing(SchoolClass::getName))
                            .toList()
                ));
    }

    private List<AdminFundraisingResponse> toFundraisingResponses(List<Fundraising> fundraisings)
    {
        if(fundraisings.isEmpty())
        {
            return List.of();
        }

        List<Integer> ids = fundraisings.stream().map(Fundraising::getId).toList();

        Map<Integer, BigDecimal> collected = contributionRepository.sumActiveAmountsByFundraisingIdIn(ids).stream()
                .collect(Collectors.toMap(FundraisingPaidAmount::getFundraisingId, FundraisingPaidAmount::getAmount));
        Map<Integer, BigDecimal> balances = walletRepository.findAllByFundraisingIdIn(ids).stream()
                .collect(Collectors.toMap(wallet -> wallet.getFundraising().getId(), Wallet::getBalance));

        return fundraisings.stream()
                .map(fundraising -> AdminFundraisingResponse.from(
                    fundraising,
                    collected.getOrDefault(fundraising.getId(), BigDecimal.ZERO),
                    balances.getOrDefault(fundraising.getId(), BigDecimal.ZERO)
                ))
                .toList();
    }

    private BigDecimal collectedAmount(Integer fundraisingId)
    {
        return contributionRepository.sumActiveAmountByFundraisingId(fundraisingId).orElse(BigDecimal.ZERO);
    }

    private BigDecimal walletBalance(Integer fundraisingId)
    {
        return walletRepository.findBalanceByFundraisingId(fundraisingId).orElse(BigDecimal.ZERO);
    }

    private User findUser(Integer userId)
    {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with id " + userId + " not found"));
    }

    private SchoolClass findClassIncludingDeleted(Integer classId)
    {
        return schoolClassRepository.findByIdWithOwnerIncludingDeleted(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class with id " + classId + " not found"));
    }

    private Fundraising findFundraising(Integer fundraisingId)
    {
        return fundraisingRepository.findById(fundraisingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising with id " + fundraisingId + " not found"));
    }
}