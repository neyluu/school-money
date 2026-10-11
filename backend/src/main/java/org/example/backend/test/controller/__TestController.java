package org.example.backend.test.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.utils.FileProcessor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class __TestController
{
    private final FileProcessor fileProcessor;

    @GetMapping("hello-world")
    public ResponseEntity<String> helloWorld()
    {
        return ResponseEntity.ok("Hello world");
    }

//    Example endpoint that can take image as parameter, allowed types are PNG, PJEG and PDF with size limit of 25MB per request
    @PostMapping(value = "/single-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> singleImage(@RequestParam("file") MultipartFile file)
    {
        fileProcessor.save(file);
        return ResponseEntity.ok().build();
    }
}
