package org.example.backend.children.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.children.dto.request.ChildCreateRequest;
import org.example.backend.children.dto.response.ChildResponse;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.User;
import org.example.backend.core.repository.ChildRepository;
import org.example.backend.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChildrenService
{
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChildResponse create(ChildCreateRequest request, Integer parentId)
    {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Child child = new Child();
        child.setParent(parent);
        child.setFirstName(request.firstname().trim());
        child.setLastName(request.lastname().trim());
        child.setBirthDate(request.birthDate());

        childRepository.save(child);

        return new ChildResponse(
            child.getId(),
            child.getFirstName(),
            child.getLastName(),
            child.getBirthDate(),
            getAvatarId(child)
        );
    }

    public List<ChildResponse> getAll(Integer parentId)
    {
        List<Child> children = childRepository.findByParentId(parentId);

        return children.stream().map(child -> new ChildResponse(
            child.getId(),
            child.getFirstName(),
            child.getLastName(),
            child.getBirthDate(),
            getAvatarId(child)
        )).toList();
    }

    private Integer getAvatarId(Child child)
    {
        return child.getAvatarFile() != null ? child.getAvatarFile().getId() : null;
    }
}
