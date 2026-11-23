package org.example.backend.payments.utils;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.payments.dto.request.ContributionFilter;
import org.example.backend.payments.dto.request.HistorySearchRequest;
import org.example.backend.payments.dto.request.TransactionFilter;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class HistorySpecifications
{
    private static final char ESCAPE = '\\';

    private HistorySpecifications() {}

    public static Specification<Transaction> transactions(Integer walletId, TransactionFilter filter, HistorySearchRequest search)
    {
        return (root, query, builder) ->
        {
            Predicate outgoing = builder.equal(root.join("fromWallet", JoinType.LEFT).get("id"), walletId);
            Predicate incoming = builder.equal(root.join("toWallet", JoinType.LEFT).get("id"), walletId);
            Predicate notRefund = builder.notEqual(root.get("type"), TransactionType.REFUND);
            Predicate refund = builder.equal(root.get("type"), TransactionType.REFUND);

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(switch(filter)
            {
                case ALL -> builder.or(incoming, outgoing);
                case INCOME -> builder.and(incoming, notRefund);
                case OUTCOME -> builder.and(outgoing, notRefund);
                case REFUNDS -> builder.and(builder.or(incoming, outgoing), refund);
            });

            addPeriod(predicates, builder, root.get("createdAt"), search);
            addAmount(predicates, builder, root.get("amount"), search);

            if(hasText(search.search()))
            {
                predicates.add(contains(builder, root.get("title"), search.search()));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<FundraisingContribution> contributions(Integer payerId, ContributionFilter filter, HistorySearchRequest search)
    {
        return (root, query, builder) ->
        {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.equal(root.get("payer").get("id"), payerId));

            switch(filter)
            {
                case ALL -> {}
                case COMPLETED -> predicates.add(builder.isNull(root.get("refundTransaction")));
                case REFUNDED -> predicates.add(builder.isNotNull(root.get("refundTransaction")));
            }

            addPeriod(predicates, builder, root.get("createdAt"), search);
            addAmount(predicates, builder, root.get("transaction").get("amount"), search);

            if(hasText(search.search()))
            {
                Expression<String> childName = builder.concat(
                    builder.concat(root.get("child").get("firstName"), " "),
                    root.get("child").get("lastName")
                );

                predicates.add(builder.or(
                    contains(builder, root.get("fundraising").get("name"), search.search()),
                    contains(builder, childName, search.search())
                ));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static void addPeriod(List<Predicate> predicates, CriteriaBuilder builder, Expression<Instant> createdAt, HistorySearchRequest search)
    {
        if(search.from() != null)
        {
            predicates.add(builder.greaterThanOrEqualTo(createdAt, search.from()));
        }
        if(search.to() != null)
        {
            predicates.add(builder.lessThan(createdAt, search.to()));
        }
    }

    private static void addAmount(List<Predicate> predicates, CriteriaBuilder builder, Expression<BigDecimal> amount, HistorySearchRequest search)
    {
        if(search.minAmount() != null)
        {
            predicates.add(builder.greaterThanOrEqualTo(amount, search.minAmount()));
        }
        if(search.maxAmount() != null)
        {
            predicates.add(builder.lessThanOrEqualTo(amount, search.maxAmount()));
        }
    }

    private static Predicate contains(CriteriaBuilder builder, Expression<String> value, String text)
    {
        String escaped = text.trim().toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");

        return builder.like(builder.lower(value), "%" + escaped + "%", ESCAPE);
    }

    private static boolean hasText(String value)
    {
        return value != null && !value.isBlank();
    }
}
