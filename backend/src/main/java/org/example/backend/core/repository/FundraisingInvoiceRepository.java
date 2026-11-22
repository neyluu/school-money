package org.example.backend.core.repository;

import org.example.backend.core.entity.FundraisingInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface FundraisingInvoiceRepository extends JpaRepository<FundraisingInvoice, Integer> {
    @Query("""
        SELECT i.id AS id, i.title AS title, i.createdAt AS createdAt,
               i.file.id AS fileId, i.file.filename AS filename,
               i.file.contentType AS contentType, i.file.sizeBytes AS sizeBytes
        FROM FundraisingInvoice i
        WHERE i.fundraising.id = :fundraisingId
        ORDER BY i.id DESC
        """)
    List<InvoiceView> findAllViewsByFundraisingId(@Param("fundraisingId") Integer fundraisingId);

    @Query("SELECT i.file.id FROM FundraisingInvoice i WHERE i.id = :invoiceId AND i.fundraising.id = :fundraisingId")
    Optional<Integer> findFileId(@Param("invoiceId") Integer invoiceId, @Param("fundraisingId") Integer fundraisingId);

    interface InvoiceView {
        Integer getId();

        String getTitle();

        Instant getCreatedAt();

        Integer getFileId();

        String getFilename();

        String getContentType();

        Integer getSizeBytes();
    }
}
