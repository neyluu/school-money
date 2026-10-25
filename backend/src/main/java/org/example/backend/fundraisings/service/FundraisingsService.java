package org.example.backend.fundraisings.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.core.entity.Fundraising;
import org.example.backend.core.entity.SchoolClass;
import org.example.backend.core.repository.FundraisingRepository;
import org.example.backend.core.repository.SchoolClassRepository;
import org.example.backend.fundraisings.dto.request.CreateFundraiseRequest;
import org.example.backend.fundraisings.dto.response.FundraiseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FundraisingsService
{
    private final SchoolClassRepository schoolClassRepository;
    private final FundraisingRepository fundraisingRepository;

    public FundraiseResponse createFundraise(Integer userId, CreateFundraiseRequest request)
    {
        SchoolClass schoolClass = getClassIfUserIsOwner(userId, request.classId());

        if( ! request.startDate().isBefore(request.endDate()))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "StartDate must be before EndDate");
        }

        Fundraising fundraising = new Fundraising();
        fundraising.setSchoolClass(schoolClass);
        fundraising.setLogoFile(null);
        fundraising.setName(request.name());
        fundraising.setDescription(request.description() == null ? "" : request.description());
        fundraising.setStartAt(request.startDate());
        fundraising.setEndAt(request.endDate());
        fundraising.setAmountPerChild(request.perChildAmount());

        fundraisingRepository.save(fundraising);

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

    private SchoolClass getClassIfUserIsOwner(Integer userId, Integer classId)
    {
        SchoolClass schoolClass = getSchoolClass(classId);

        if( ! Objects.equals(schoolClass.getOwner().getId(), userId))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized for this class");
        }

        return schoolClass;
    }

    private SchoolClass getSchoolClass(Integer id)
    {
        return schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
    }
}
