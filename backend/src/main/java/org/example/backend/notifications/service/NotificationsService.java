package org.example.backend.notifications.service;

import jakarta.persistence.EntityManager;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.notifications.dto.NotificationItem;
import org.example.backend.notifications.dto.NotificationsResponse;
import org.example.backend.notifications.repository.NotificationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationsService {

    private static final Duration DEFAULT_WINDOW = Duration.ofDays(7);
    private static final int MAX_PAYMENTS = 20;

    private final EntityManager entityManager;
    private final ClassMembershipRepository membershipRepository;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public NotificationsResponse get(Integer userId, String sinceRaw) {
        List<SchoolClass> owned = entityManager
            .createQuery(
                "SELECT c FROM SchoolClass c WHERE c.owner.id = :ownerId AND c.deletedAt IS NULL ORDER BY c.name",
                SchoolClass.class
            )
            .setParameter("ownerId", userId)
            .getResultList();

        if (owned.isEmpty()) {
            return new NotificationsResponse(false, List.of());
        }

        Map<Integer, String> classNames = owned
            .stream()
            .collect(
                Collectors.toMap(SchoolClass::getId, SchoolClass::getName)
            );
        List<NotificationItem> items = new ArrayList<>();

        membershipRepository
            .countByClassIdsAndStatus(
                classNames.keySet(),
                MembershipStatus.PENDING
            )
            .forEach(row ->
                items.add(
                    new NotificationItem(
                        "pending-" + row.getClassId(),
                        NotificationItem.PENDING_REQUESTS,
                        "Zgłoszenia do zatwierdzenia",
                        row.getCount() +
                            (row.getCount() == 1
                                ? " dziecko czeka"
                                : " dzieci czeka") +
                            " w klasie " +
                            classNames.get(row.getClassId()),
                        "/dashboard/class/" + row.getClassId(),
                        null
                    )
                )
            );

        Instant since = parseSince(sinceRaw);
        for (FundraisingContribution payment : notificationRepository.findRecentPaymentsForOwner(
            userId,
            since,
            PageRequest.of(0, MAX_PAYMENTS)
        )) {
            items.add(
                new NotificationItem(
                    "payment-" + payment.getId(),
                    NotificationItem.NEW_PAYMENT,
                    "Nowa wpłata na zbiórkę",
                    payment.getChild().getFirstName() +
                        " " +
                        payment.getChild().getLastName() +
                        " · " +
                        payment.getFundraising().getName() +
                        " · " +
                        money(payment.getTransaction().getAmount()),
                    "/dashboard/fundraisers/" +
                        payment.getFundraising().getId(),
                    payment.getCreatedAt()
                )
            );
        }

        return new NotificationsResponse(true, items);
    }

    private static Instant parseSince(String raw) {
        if (raw == null || raw.isBlank()) {
            return Instant.now().minus(DEFAULT_WINDOW);
        }
        try {
            return Instant.parse(raw);
        } catch (Exception e) {
            return Instant.now().minus(DEFAULT_WINDOW);
        }
    }

    private static String money(java.math.BigDecimal value) {
        return (
            value
                .setScale(2, RoundingMode.HALF_UP)
                .toPlainString()
                .replace('.', ',') + " zł"
        );
    }
}
