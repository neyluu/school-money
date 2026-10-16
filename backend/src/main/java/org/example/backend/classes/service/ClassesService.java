package org.example.backend.classes.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.classes.dto.response.ClassLookupResponse;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.repository.SchoolClassRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ClassesService
{
    private final SchoolClassRepository schoolClassRepository;

    public ClassLookupResponse lookup(String code)
    {
        String normalized = code == null ? "" : code.trim().toUpperCase();
        if(normalized.isBlank())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Access code cannot be empty");
        }

        SchoolClass schoolClass = schoolClassRepository.findByAccessCodeAndIsBlocked(normalized, false)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));

        return ClassLookupResponse.from(schoolClass);
    }
}
