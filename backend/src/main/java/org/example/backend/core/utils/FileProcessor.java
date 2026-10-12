package org.example.backend.core.utils;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.dto.response.FileDto;
import org.example.backend.core.dto.response.FileInfoDto;
import org.example.backend.core.entity.File;
import org.example.backend.core.exception.InvalidFileException;
import org.example.backend.core.repository.FileRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class FileProcessor {

    private final FileRepository fileRepository;
    private final Set<String> ALLOWED_TYPES = Set.of(
        "image/png",
        "image/jpeg",
        "application/pdf"
    );


    // Exception is automatically catched by GlobalExceptionHandler with 400 code.
    // PNG, JPEG and PDF files are accepted
    public FileInfoDto save(MultipartFile file) throws InvalidFileException
    {
        if(file == null || file.isEmpty())
        {
            throw new InvalidFileException("File is empty");
        }

        String filename = file.getOriginalFilename();

        String contentType = file.getContentType();
        if(contentType == null || ! ALLOWED_TYPES.contains(contentType))
        {
            throw new InvalidFileException("Unsupported file type: " + contentType);
        }

        int size = (int) file.getSize();

        byte[] bytes = null;
        try
        {
            bytes = file.getBytes();
        }
        catch (IOException e)
        {
            throw new InvalidFileException("Cannot read bytes from file");
        }

        File newFile = new File();
        newFile.setFilename(filename);
        newFile.setContentType(contentType);
        newFile.setSizeBytes(size);
        newFile.setData(bytes);

        File saved = fileRepository.save(newFile);

        return new FileInfoDto(
            saved.getId(),
            saved.getFilename(),
            saved.getContentType(),
            saved.getSizeBytes()
        );
    }

    public FileDto load(Integer id)
    {
        File file = fileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        return new FileDto(
            file.getId(),
            file.getFilename(),
            file.getContentType(),
            file.getSizeBytes(),
            file.getData()
        );
    }

    public ResponseEntity<byte[]> get(FileDto file)
    {
        return ResponseEntity.ok()
            .contentType(
                MediaType.parseMediaType(file.contentType())
            )
            .contentLength(file.sizeBytes())
            .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.inline()
                    .filename(file.filename(), StandardCharsets.UTF_8)
                    .build().toString())
            .body(file.data());
    }
}
