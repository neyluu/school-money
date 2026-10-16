package org.example.backend.classes.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.example.backend.classes.dto.response.ClassLookupResponse;
import org.example.backend.classes.service.ClassesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/classes")
@RequiredArgsConstructor
public class ClassesController
{
    private final ClassesService classesService;


    @Operation(summary = "Look up class by access code")
    @GetMapping("/lookup")
    public ResponseEntity<ClassLookupResponse> lookup(@RequestParam("code") String code)
    {
        return ResponseEntity.ok(classesService.lookup(code));
    }
}
