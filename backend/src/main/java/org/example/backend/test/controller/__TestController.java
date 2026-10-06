package org.example.backend.test.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.__TestEntity;
import org.example.backend.core.repository.__TestEntityRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class __TestController
{
    private final __TestEntityRepository testEntityRepository;

    @GetMapping("hello-world")
    public ResponseEntity<String> helloWorld()
    {
        __TestEntity t = new __TestEntity();
        t.setName("test");
        testEntityRepository.save(t);

        return ResponseEntity.ok("Hello world");
    }
}
