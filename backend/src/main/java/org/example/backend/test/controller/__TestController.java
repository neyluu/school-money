package org.example.backend.test.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class __TestController
{
    @GetMapping("hello-world")
    public ResponseEntity<String> helloWorld()
    {
        return ResponseEntity.ok("Hello world");
    }
}
