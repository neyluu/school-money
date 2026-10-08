package org.example.backend.auth.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.auth.dto.request.LoginRequest;
import org.example.backend.auth.dto.request.RegisterRequest;
import org.example.backend.auth.dto.response.AuthResponse;
import org.example.backend.auth.dto.response.UserResponse;
import org.example.backend.auth.exception.AccountBlockedException;
import org.example.backend.auth.exception.EmailAlreadyInUseException;
import org.example.backend.auth.exception.InvalidCredentialsException;
import org.example.backend.auth.mapper.UserMapper;
import org.example.backend.auth.security.JwtService;
import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.UserRole;
import org.example.backend.core.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User user = createUser(
            request.email(),
            request.firstName(),
            request.lastName(),
            request.password(),
            UserRole.USER
        );
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
            .orElseThrow(InvalidCredentialsException::new);

        if (user.getIsBlocked()) {
            throw new AccountBlockedException();
        }

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Integer userId) {
        return userRepository.findById(userId)
            .map(userMapper::toResponse)
            .orElseThrow(InvalidCredentialsException::new);
    }

    @Transactional
    public User createUser(String email, String firstName, String lastName, String rawPassword, UserRole role) {
        String normalizedEmail = normalizeEmail(email);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyInUseException();
        }

        Instant now = Instant.now();

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setIsBlocked(false);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        try {
            return userRepository.saveAndFlush(user);
        }
        catch (DataIntegrityViolationException ex) {
            throw new EmailAlreadyInUseException();
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(
            jwtService.generateToken(user),
            TOKEN_TYPE,
            jwtService.getExpirationSeconds(),
            userMapper.toResponse(user)
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
