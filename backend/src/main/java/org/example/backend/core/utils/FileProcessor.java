package org.example.backend.core.utils;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.File;
import org.example.backend.core.exception.InvalidFileException;
import org.example.backend.core.repository.FileRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Locale;
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
    private final int MAX_IMAGE_SIZE = 256;


    // Exception is automatically catched by GlobalExceptionHandler with 400 code.
    // PNG, JPEG and PDF files are accepted, with size limit of 3MB and image resolution limit of 256x256
    public void save(MultipartFile file) throws InvalidFileException
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

        if(isImage(contentType))
        {
           validateImageSize(file);
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

        fileRepository.save(newFile);
    }

    private boolean isImage(String contentType)
    {
        return contentType != null && contentType.toLowerCase(Locale.ROOT).startsWith("image/");
    }

    private void validateImageSize(MultipartFile file) throws InvalidFileException
    {
        BufferedImage image = null;
        try
        {
            image = ImageIO.read(file.getInputStream());
            if(image == null)
            {
                throw new InvalidFileException("Not a valid image");
            }

            int width = image.getWidth();
            int height = image.getHeight();

            if(width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE)
            {
                throw new InvalidFileException("Image resolution is too big, max resolution: " + MAX_IMAGE_SIZE + "x" + MAX_IMAGE_SIZE);
            }
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }
}
