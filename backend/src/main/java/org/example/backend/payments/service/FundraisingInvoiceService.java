package org.example.backend.payments.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.dto.response.FileDto;
import org.example.backend.core.dto.response.FileInfoDto;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.FundraisingInvoice;
import org.example.backend.core.repository.FileRepository;
import org.example.backend.core.repository.FundraisingInvoiceRepository;
import org.example.backend.core.repository.FundraisingInvoiceRepository.InvoiceView;
import org.example.backend.core.utils.FileProcessor;
import org.example.backend.payments.dto.response.FundraisingInvoiceResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FundraisingInvoiceService
{
    private static final int MAX_TITLE_LENGTH = 100;

    private final FundraisingAccessService accessService;
    private final FundraisingInvoiceRepository invoiceRepository;
    private final FileRepository fileRepository;
    private final FileProcessor fileProcessor;

    @Transactional
    public FundraisingInvoiceResponse add(Integer fundraisingId, Integer userId, String title, MultipartFile file)
    {
        Fundraising fundraising = accessService.find(fundraisingId);
        accessService.requireOwner(fundraising, userId);
        accessService.requireNotBlocked(fundraising);

        String normalizedTitle = normalizeTitle(title);
        FileInfoDto saved = fileProcessor.save(file);

        FundraisingInvoice invoice = new FundraisingInvoice();
        invoice.setFundraising(fundraising);
        invoice.setFile(fileRepository.getReferenceById(saved.id()));
        invoice.setTitle(normalizedTitle);
        invoiceRepository.saveAndFlush(invoice);

        return new FundraisingInvoiceResponse(invoice.getId(), invoice.getTitle(), saved, invoice.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<FundraisingInvoiceResponse> getAll(Integer fundraisingId, Integer userId)
    {
        Fundraising fundraising = accessService.find(fundraisingId);
        accessService.requireClassAccess(fundraising, userId);

        return invoiceRepository.findAllViewsByFundraisingId(fundraisingId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getFile(Integer fundraisingId, Integer invoiceId, Integer userId)
    {
        Fundraising fundraising = accessService.find(fundraisingId);
        accessService.requireClassAccess(fundraising, userId);

        Integer fileId = invoiceRepository.findFileId(invoiceId, fundraisingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice with id " + invoiceId + " not found"));

        FileDto file = fileProcessor.load(fileId);
        return fileProcessor.get(file);
    }

    private String normalizeTitle(String title)
    {
        if(title == null || title.isBlank())
        {
            return null;
        }

        String trimmed = title.trim();
        if(trimmed.length() > MAX_TITLE_LENGTH)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must contain at most 100 characters");
        }

        return trimmed;
    }

    private FundraisingInvoiceResponse toResponse(InvoiceView view)
    {
        FileInfoDto file = new FileInfoDto(
            view.getFileId(),
            view.getFilename(),
            view.getContentType(),
            view.getSizeBytes()
        );

        return new FundraisingInvoiceResponse(view.getId(), view.getTitle(), file, view.getCreatedAt());
    }
}
