package org.example.backend.classes.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.classes.dto.request.ClassCreateRequest;
import org.example.backend.classes.dto.request.ClassJoinRequest;
import org.example.backend.classes.dto.request.ClassUpdateRequest;
import org.example.backend.classes.dto.response.AccessCodeResponse;
import org.example.backend.classes.dto.response.ClassLookupResponse;
import org.example.backend.classes.dto.response.ClassResponse;
import org.example.backend.classes.dto.response.ClassSummaryResponse;
import org.example.backend.classes.dto.response.MembershipResponse;
import org.example.backend.classes.dto.response.PendingMembershipResponse;
import org.example.backend.classes.utils.AccessCodeGenerator;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.ClassMembership;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.entity.types.MembershipStatus;
import org.example.backend.core.repository.ChildRepository;
import org.example.backend.core.repository.ClassMembershipRepository;
import org.example.backend.core.repository.ClassMembershipRepository.ClassMembershipCount;
import org.example.backend.core.repository.FundraisingRepository;
import org.example.backend.core.repository.SchoolClassRepository;
import org.example.backend.core.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassesService
{
    private static final int MAX_ACCESS_CODE_ATTEMPTS = 10;

    private final SchoolClassRepository schoolClassRepository;
    private final ClassMembershipRepository membershipRepository;
    private final ChildRepository childRepository;
    private final FundraisingRepository fundraisingRepository;
    private final UserRepository userRepository;
    private final AccessCodeGenerator accessCodeGenerator;

    public ClassLookupResponse lookup(String code)
    {
        String normalized = normalizeAccessCode(code);
        if(normalized.isBlank())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Access code cannot be empty");
        }

        SchoolClass schoolClass = schoolClassRepository.findByAccessCodeAndIsBlocked(normalized, false)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));

        return ClassLookupResponse.from(schoolClass);
    }

    @Transactional(readOnly = true)
    public List<ClassSummaryResponse> getAll(Integer userId)
    {
        List<SchoolClass> classes = schoolClassRepository.findAllForUser(userId);
        if(classes.isEmpty())
        {
            return List.of();
        }

        List<Integer> classIds = classes.stream().map(SchoolClass::getId).toList();
        Map<Integer, Long> childrenCounts = membershipRepository
                .countByClassIdsAndStatus(classIds, MembershipStatus.ACCEPTED).stream()
                .collect(Collectors.toMap(ClassMembershipCount::getClassId, ClassMembershipCount::getCount));
        Map<Integer, List<ClassMembership>> myMemberships = membershipRepository.findAllByParentId(userId).stream()
                .collect(Collectors.groupingBy(membership -> membership.getSchoolClass().getId()));

        return classes.stream()
                .map(schoolClass -> ClassSummaryResponse.from(
                    schoolClass,
                    isOwner(schoolClass, userId),
                    childrenCounts.getOrDefault(schoolClass.getId(), 0L),
                    myMemberships.getOrDefault(schoolClass.getId(), List.of())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public ClassResponse find(Integer classId, Integer userId)
    {
        SchoolClass schoolClass = findClass(classId);
        boolean isOwner = isOwner(schoolClass, userId);

        boolean hasAcceptedChild = membershipRepository.existsBySchoolClassIdAndChildParentIdAndChildActiveAndStatus(
            classId, userId, true, MembershipStatus.ACCEPTED
        );
        if(!isOwner && !hasAcceptedChild)
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this class");
        }

        return toResponse(schoolClass, isOwner);
    }

    @Transactional
    public ClassResponse create(ClassCreateRequest request, Integer userId)
    {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setOwner(userRepository.getReferenceById(userId));
        schoolClass.setName(request.name().trim());
        schoolClass.setSchool(request.school().trim());
        schoolClass.setCity(request.city().trim());
        schoolClass.setAccessCode(generateUniqueAccessCode());
        schoolClass.setIsBlocked(false);

        schoolClassRepository.saveAndFlush(schoolClass);

        return ClassResponse.from(schoolClass, true, List.of());
    }

    @Transactional
    public ClassResponse update(Integer classId, ClassUpdateRequest request, Integer userId)
    {
        SchoolClass schoolClass = findOwnedClass(classId, userId);

        if(request.name() != null)
        {
            schoolClass.setName(request.name().trim());
        }
        if(request.school() != null)
        {
            schoolClass.setSchool(request.school().trim());
        }
        if(request.city() != null)
        {
            schoolClass.setCity(request.city().trim());
        }

        schoolClassRepository.saveAndFlush(schoolClass);

        return toResponse(schoolClass, true);
    }

    @Transactional
    public void remove(Integer classId, Integer userId)
    {
        SchoolClass schoolClass = findOwnedClass(classId, userId);

        if(fundraisingRepository.existsBySchoolClassId(classId))
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Class has fundraisings and cannot be deleted");
        }

        membershipRepository.deleteAllByClassId(classId);
        schoolClassRepository.delete(schoolClass);
    }

    @Transactional(readOnly = true)
    public List<PendingMembershipResponse> getPendingMemberships(Integer classId, Integer userId)
    {
        findOwnedClass(classId, userId);

        return membershipRepository.findAllByClassIdAndStatus(classId, MembershipStatus.PENDING).stream()
                .map(PendingMembershipResponse::from)
                .toList();
    }

    @Transactional
    public MembershipResponse acceptMembership(Integer classId, Integer childId, Integer userId)
    {
        findOwnedClass(classId, userId);
        ClassMembership membership = findMembership(classId, childId);

        if(membership.getStatus() == MembershipStatus.ACCEPTED)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Child is already accepted to this class");
        }

        membership.setStatus(MembershipStatus.ACCEPTED);
        membership.setDecidedAt(Instant.now());

        return MembershipResponse.from(membership);
    }

    @Transactional
    public void removeMembership(Integer classId, Integer childId, Integer userId)
    {
        findOwnedClass(classId, userId);
        membershipRepository.delete(findMembership(classId, childId));
    }

    @Transactional
    public void removeChild(Integer classId, Integer childId, Integer userId)
    {
        SchoolClass schoolClass = findClass(classId);
        ClassMembership membership = findMembership(classId, childId);

        boolean isParent = membership.getChild().getParent().getId().equals(userId);
        if(!isParent && !isOwner(schoolClass, userId))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the child's parent or the class owner can remove the child");
        }

        membershipRepository.delete(membership);
    }

    @Transactional
    public AccessCodeResponse regenerateAccessCode(Integer classId, Integer userId)
    {
        SchoolClass schoolClass = findOwnedClass(classId, userId);

        schoolClass.setAccessCode(generateUniqueAccessCode());
        schoolClassRepository.saveAndFlush(schoolClass);

        return new AccessCodeResponse(schoolClass.getAccessCode());
    }

    @Transactional
    public MembershipResponse join(ClassJoinRequest request, Integer userId)
    {
        Child child = childRepository.findByIdAndParentIdAndActive(request.childId(), userId, true)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Child with id " + request.childId() + " not found"));

        SchoolClass schoolClass = schoolClassRepository.findByAccessCodeAndIsBlocked(normalizeAccessCode(request.accessCode()), false)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));

        if(membershipRepository.existsByChildId(child.getId()))
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Child is already assigned to a class or has a pending request");
        }

        Instant now = Instant.now();
        boolean isOwner = isOwner(schoolClass, userId);

        ClassMembership membership = new ClassMembership();
        membership.setSchoolClass(schoolClass);
        membership.setChild(child);
        membership.setStatus(isOwner ? MembershipStatus.ACCEPTED : MembershipStatus.PENDING);
        membership.setRequestedAt(now);
        membership.setDecidedAt(isOwner ? now : null);

        try
        {
            membershipRepository.saveAndFlush(membership);
        }
        catch(DataIntegrityViolationException ex)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Child is already assigned to a class or has a pending request");
        }

        return MembershipResponse.from(membership);
    }

    private ClassResponse toResponse(SchoolClass schoolClass, boolean isOwner)
    {
        List<ClassMembership> accepted = membershipRepository.findAllByClassIdAndStatus(schoolClass.getId(), MembershipStatus.ACCEPTED);
        return ClassResponse.from(schoolClass, isOwner, accepted);
    }

    private SchoolClass findClass(Integer classId)
    {
        return schoolClassRepository.findByIdWithOwner(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class with id " + classId + " not found"));
    }

    private SchoolClass findOwnedClass(Integer classId, Integer userId)
    {
        SchoolClass schoolClass = findClass(classId);
        if(!isOwner(schoolClass, userId))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the class owner can perform this action");
        }
        return schoolClass;
    }

    private ClassMembership findMembership(Integer classId, Integer childId)
    {
        return membershipRepository.findByClassIdAndChildId(classId, childId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Child is not a member of this class"));
    }

    private boolean isOwner(SchoolClass schoolClass, Integer userId)
    {
        return schoolClass.getOwner().getId().equals(userId);
    }

    private String normalizeAccessCode(String code)
    {
        return code == null ? "" : code.trim().toUpperCase();
    }

    private String generateUniqueAccessCode()
    {
        for(int i = 0; i < MAX_ACCESS_CODE_ATTEMPTS; i++)
        {
            String code = accessCodeGenerator.generate();
            if(!schoolClassRepository.existsByAccessCode(code))
            {
                return code;
            }
        }
        throw new IllegalStateException("Could not generate unique access code");
    }
}
