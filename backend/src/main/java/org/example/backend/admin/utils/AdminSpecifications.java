package org.example.backend.admin.utils;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CommonAbstractCriteria;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.example.backend.admin.dto.request.AdminClassFilter;
import org.example.backend.admin.dto.request.AdminFundraisingFilter;
import org.example.backend.admin.dto.request.AdminUserFilter;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.MembershipStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class AdminSpecifications
{
    private static final char ESCAPE = '\\';

    private AdminSpecifications() {}

    public static Specification<User> users(AdminUserFilter filter)
    {
        return (root, query, builder) ->
        {
            List<Predicate> predicates = new ArrayList<>();

            if(filter.role() != null)
            {
                predicates.add(builder.equal(root.get("role"), filter.role()));
            }
            if(filter.blocked() != null)
            {
                predicates.add(builder.equal(root.get("isBlocked"), filter.blocked()));
            }
            if(filter.classId() != null)
            {
                predicates.add(builder.or(
                    builder.exists(ownedClassSubquery(root, query, builder, filter.classId())),
                    builder.exists(classMemberSubquery(root, query, builder, filter.classId()))
                ));
            }
            if(filter.from() != null)
            {
                predicates.add(builder.greaterThanOrEqualTo(root.get("createdAt"), filter.from()));
            }
            if(filter.to() != null)
            {
                predicates.add(builder.lessThan(root.get("createdAt"), filter.to()));
            }
            if(hasText(filter.search()))
            {
                Expression<String> fullName = builder.concat(
                    builder.concat(root.get("firstName"), " "),
                    root.get("lastName")
                );

                predicates.add(builder.or(
                    contains(builder, root.get("email"), filter.search()),
                    contains(builder, fullName, filter.search())
                ));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<User> treasurers(AdminUserFilter filter)
    {
        return (root, query, builder) ->
        {
            Subquery<Integer> ownedClass = query.subquery(Integer.class);
            Root<SchoolClass> schoolClass = ownedClass.from(SchoolClass.class);
            ownedClass.select(schoolClass.get("id")).where(
                builder.equal(schoolClass.get("owner").get("id"), root.get("id")),
                builder.isNull(schoolClass.get("deletedAt"))
            );

            return builder.and(
                users(filter).toPredicate(root, query, builder),
                builder.exists(ownedClass)
            );
        };
    }

    public static Specification<SchoolClass> classes(AdminClassFilter filter)
    {
        return (root, query, builder) ->
        {
            List<Predicate> predicates = new ArrayList<>();

            if(!Boolean.TRUE.equals(filter.includeDeleted()))
            {
                predicates.add(builder.isNull(root.get("deletedAt")));
            }
            if(filter.blocked() != null)
            {
                predicates.add(builder.equal(root.get("isBlocked"), filter.blocked()));
            }
            if(filter.ownerId() != null)
            {
                predicates.add(builder.equal(root.get("owner").get("id"), filter.ownerId()));
            }
            if(hasText(filter.search()))
            {
                predicates.add(builder.or(
                    contains(builder, root.get("name"), filter.search()),
                    contains(builder, root.get("school"), filter.search()),
                    contains(builder, root.get("city"), filter.search())
                ));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<Fundraising> fundraisings(AdminFundraisingFilter filter)
    {
        return (root, query, builder) ->
        {
            List<Predicate> predicates = new ArrayList<>();

            if(filter.status() != null)
            {
                predicates.add(builder.equal(root.get("status"), filter.status()));
            }
            if(filter.blocked() != null)
            {
                predicates.add(builder.equal(root.get("isBlocked"), filter.blocked()));
            }
            if(filter.classId() != null)
            {
                predicates.add(builder.equal(root.get("schoolClass").get("id"), filter.classId()));
            }
            if(filter.ownerId() != null)
            {
                predicates.add(builder.equal(root.get("schoolClass").get("owner").get("id"), filter.ownerId()));
            }
            if(hasText(filter.search()))
            {
                predicates.add(builder.or(
                    contains(builder, root.get("name"), filter.search()),
                    contains(builder, root.get("schoolClass").get("name"), filter.search())
                ));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Subquery<Integer> ownedClassSubquery(
        Root<User> user,
        CommonAbstractCriteria query,
        CriteriaBuilder builder,
        Integer classId
    )
    {
        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<SchoolClass> schoolClass = subquery.from(SchoolClass.class);
        subquery.select(schoolClass.get("id")).where(
            builder.equal(schoolClass.get("owner").get("id"), user.get("id")),
            builder.equal(schoolClass.get("id"), classId),
            builder.isNull(schoolClass.get("deletedAt"))
        );
        return subquery;
    }

    private static Subquery<Integer> classMemberSubquery(
        Root<User> user,
        CommonAbstractCriteria query,
        CriteriaBuilder builder,
        Integer classId
    )
    {
        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<ClassMembership> membership = subquery.from(ClassMembership.class);
        subquery.select(membership.get("id")).where(
            builder.equal(membership.get("child").get("parent").get("id"), user.get("id")),
            builder.equal(membership.get("schoolClass").get("id"), classId),
            builder.equal(membership.get("status"), MembershipStatus.ACCEPTED),
            builder.isTrue(membership.get("child").get("active"))
        );
        return subquery;
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