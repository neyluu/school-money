package org.example.backend.fundraisings.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.dto.response.FileDto;
import org.example.backend.core.dto.response.FileInfoDto;
import org.example.backend.core.entity.*;
import org.example.backend.core.entity.types.FundraisingStatus;
import org.example.backend.core.entity.types.TransactionType;
import org.example.backend.core.repository.*;
import org.example.backend.core.utils.FileProcessor;
import org.example.backend.fundraisings.dto.request.CreateFundraiseRequest;
import org.example.backend.fundraisings.dto.request.UpdateFundraiseRequest;
import org.example.backend.fundraisings.dto.response.FundraiseResponse;
import org.example.backend.payments.service.FundraisingAccessService;
import org.example.backend.payments.service.LedgerService;
import org.example.backend.payments.service.WalletCreationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FundraisingsService
{
    private final FileRepository fileRepository;
    private final FileProcessor fileProcessor;
    private final SchoolClassRepository schoolClassRepository;
    private final FundraisingRepository fundraisingRepository;
    private final FundraisingContributionRepository fundraisingContributionRepository ;
    private final WalletRepository walletRepository;
    private final WalletCreationService walletCreationService;
    private final FundraisingAccessService accessService;
    private final LedgerService ledgerService;

    private static final Set<String> ALLOWED_LOGO_TYPES = Set.of("image/png", "image/jpeg");

    @Transactional
    public FundraiseResponse createFundraise(Integer userId, CreateFundraiseRequest request)
    {
        SchoolClass schoolClass = getClassIfUserIsOwner(userId, request.classId());

        Fundraising fundraising = new Fundraising();
        fundraising.setSchoolClass(schoolClass);
        fundraising.setLogoFile(null);
        fundraising.setName(request.name());
        fundraising.setDescription(request.description() == null ? "" : request.description());
        fundraising.setEndAt(request.endDate());
        fundraising.setAmountPerChild(request.perChildAmount());

        fundraisingRepository.save(fundraising);
        walletCreationService.createWallet(fundraising);

        return FundraiseResponse.from(fundraising, userId);
    }

    public List<FundraiseResponse> findAll(Integer userId, Integer classId)
    {
        List<Fundraising> fundraisings;

        if(classId == null)
        {
            fundraisings = fundraisingRepository.findAllByUserId(userId);
        }
        else
        {
            fundraisings = fundraisingRepository.findAllByUserIdAndClassId(userId, classId);
        }

        return fundraisings.stream()
                .map(fundraise -> FundraiseResponse.from(fundraise, userId))
                .toList();
    }

    public FundraiseResponse findById(Integer userId, Integer fundraiseId)
    {
        Fundraising fundraising = fundraisingRepository
                .findByIdAndUserId(fundraiseId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising not found"));

        return FundraiseResponse.from(fundraising, userId);
    }

    @Transactional
    public FundraiseResponse updateFundraise(Integer userId, Integer fundraiseId, UpdateFundraiseRequest request)
    {
        Fundraising fundraising = getFundraisingIfOwner(userId, fundraiseId);
        accessService.requireNotBlocked(fundraising);

        if(request.name() != null)
        {
            fundraising.setName(request.name().trim());
        }
        if(request.description() != null)
        {
            fundraising.setDescription(request.description().trim());
        }
        if(request.endDate() != null)
        {
            fundraising.setEndAt(request.endDate());
        }
        if(request.perChildAmount() != null)
        {
            if(request.perChildAmount().compareTo(fundraising.getAmountPerChild()) < 0)
            {
                refundOverpayments(fundraising, request.perChildAmount());
            }

            fundraising.setAmountPerChild(request.perChildAmount());
        }

        fundraisingRepository.save(fundraising);
        return FundraiseResponse.from(fundraising, userId);
    }

    @Transactional
    public FundraiseResponse closeFundraise(Integer userId, Integer fundraiseId)
    {
        Fundraising fundraising = accessService.findForUpdate(fundraiseId);
        accessService.requireOwner(fundraising, userId);
        accessService.requireNotBlocked(fundraising);
        accessService.requireActive(fundraising);

        BigDecimal balance = walletRepository.findBalanceByFundraisingId(fundraiseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising wallet not found"));

        if(balance.signum() > 0)
        {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Fundraising wallet still holds " + balance.toPlainString() + ", withdraw it or refund contributions before closing"
            );
        }

        fundraising.setStatus(FundraisingStatus.CLOSED);
        fundraising.setClosedAt(Instant.now());

        return FundraiseResponse.from(fundraising, userId);
    }

    @Transactional
    public FileInfoDto putLogo(Integer userId, Integer fundraiseId, MultipartFile logo)
    {
        Fundraising fundraising = getFundraisingIfOwner(userId, fundraiseId);
        accessService.requireNotBlocked(fundraising);

        FileInfoDto saved = fileProcessor.save(logo);
        File oldLogo = fundraising.getLogoFile();
        fundraising.setLogoFile(fileRepository.getReferenceById(saved.id()));

        if(oldLogo != null)
        {
            fileRepository.delete(oldLogo);
        }

        return saved;
    }

    public ResponseEntity<byte[]> getLogo(Integer userId, Integer fundraiseId)
    {
        Fundraising fundraising = fundraisingRepository
                .findByIdAndUserId(fundraiseId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising not found"));

        File logo = fundraising.getLogoFile();
        if(logo == null)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Logo not found");
        }

        FileDto file = fileProcessor.load(logo.getId());
        return fileProcessor.get(file);
    }

    @Transactional
    public void deleteLogo(Integer userId, Integer fundraiseId)
    {
        Fundraising fundraising = getFundraisingIfOwner(userId, fundraiseId);
        accessService.requireNotBlocked(fundraising);

        File logo = fundraising.getLogoFile();
        if(logo != null)
        {
            fileRepository.delete(logo);
            fundraising.setLogoFile(null);
        }
    }

    private SchoolClass getClassIfUserIsOwner(Integer userId, Integer classId)
    {
        SchoolClass schoolClass = getSchoolClass(classId);

        if( ! Objects.equals(schoolClass.getOwner().getId(), userId))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized for this class");
        }
        if(schoolClass.getDeletedAt() != null)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found");
        }
        if(schoolClass.getIsBlocked())
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Class is blocked");
        }

        return schoolClass;
    }

    private SchoolClass getSchoolClass(Integer id)
    {
        return schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
    }

    private Fundraising getFundraisingIfOwner(Integer userId, Integer fundraisingsId)
    {
        return fundraisingRepository.findByIdAndSchoolClassOwnerId(fundraisingsId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising not found"));
    }

    @Transactional
    protected void refundOverpayments(Fundraising fundraising, BigDecimal newValue) {
        List<FundraisingContributionRepository.ChildOverpayment> overpaid = fundraisingContributionRepository
                .findOverpaidChildren(fundraising.getId(), newValue, TransactionType.PAYMENT);
        Wallet fundraisingWallet = walletRepository.findByFundraisingId(fundraising.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fundraising wallet not found"));

        for (FundraisingContributionRepository.ChildOverpayment o : overpaid) {
            Wallet userWallet = walletRepository.findByUserId(o.getPayerId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User wallet not found"));

            BigDecimal refund = o.getNetPaid().subtract(newValue);

            Transaction refundTx = ledgerService.transfer(
                fundraisingWallet.getId(),
                userWallet.getId(),
                refund,
                TransactionType.REFUND,
                "Zwrot nadpłaty ze zbiórki " + fundraising.getName()
            );
        }
    }
}
