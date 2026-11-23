package org.example.backend.auth.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.auth.dto.request.AccountDeleteRequest;
import org.example.backend.auth.dto.request.EmailChangeRequest;
import org.example.backend.auth.dto.request.PasswordChangeRequest;
import org.example.backend.auth.dto.request.ProfileUpdateRequest;
import org.example.backend.auth.dto.response.UserResponse;
import org.example.backend.auth.exception.EmailAlreadyInUseException;
import org.example.backend.auth.mapper.UserMapper;
import org.example.backend.children.service.ChildrenService;
import org.example.backend.core.entity.Child;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.Wallet;
import org.example.backend.core.entity.types.UserRole;
import org.example.backend.core.repository.ChildRepository;
import org.example.backend.core.repository.SchoolClassRepository;
import org.example.backend.core.repository.UserRepository;
import org.example.backend.core.repository.WalletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService
{
    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final WalletRepository walletRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ChildrenService childrenService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse updateProfile(Integer userId, ProfileUpdateRequest request)
    {
        User user = findUser(userId);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setUpdatedAt(Instant.now());

        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse changeEmail(Integer userId, EmailChangeRequest request)
    {
        User user = findUser(userId);
        requirePassword(user, request.currentPassword());

        String email = AuthService.normalizeEmail(request.email());
        if(!email.equals(user.getEmail()))
        {
            if(userRepository.existsByEmailIgnoreCase(email))
            {
                throw new EmailAlreadyInUseException();
            }
            user.setEmail(email);
            user.setUpdatedAt(Instant.now());
        }

        return userMapper.toResponse(user);
    }

    @Transactional
    public void changePassword(Integer userId, PasswordChangeRequest request)
    {
        User user = findUser(userId);
        requirePassword(user, request.currentPassword());

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(Instant.now());
    }

    @Transactional
    public void deleteAccount(Integer userId, AccountDeleteRequest request)
    {
        User user = findUser(userId);
        requirePassword(user, request.password());

        if(user.getRole() == UserRole.ADMIN)
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator account cannot be deleted");
        }
        if(schoolClassRepository.existsByOwnerIdAndDeletedAtIsNull(userId))
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Delete or hand over your classes before deleting the account");
        }

        BigDecimal balance = walletRepository.findByUserId(userId).map(Wallet::getBalance).orElse(BigDecimal.ZERO);
        if(balance.signum() > 0)
        {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Withdraw money from your wallet before deleting the account");
        }

        for(Child child : childRepository.findByParentIdAndActive(userId, true))
        {
            childrenService.remove(child.getId(), userId);
        }

        user.setEmail("deleted-" + userId + "@deleted.invalid");
        user.setFirstName("Usunięte");
        user.setLastName("konto");
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setIsBlocked(true);
        user.setUpdatedAt(Instant.now());
    }

    private User findUser(Integer userId)
    {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
    }

    private void requirePassword(User user, String password)
    {
        if(!passwordEncoder.matches(password, user.getPasswordHash()))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current password is incorrect");
        }
    }
}
