package org.example.backend.auth.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.auth.service.AuthService;
import org.example.backend.core.entity.types.UserRole;
import org.example.backend.core.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements ApplicationRunner {
    private final AdminProperties adminProperties;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Override
    public void run(ApplicationArguments args) {
        String email = adminProperties.email();

        userRepository.findByEmailIgnoreCase(email).ifPresentOrElse(
            existing -> {
                if (existing.getRole() != UserRole.ADMIN) {
                    log.warn("Account {} exists but is not an admin, admin account was not created", email);
                }
            },
            () -> {
                authService.createUser(
                    email,
                    adminProperties.firstName(),
                    adminProperties.lastName(),
                    adminProperties.password(),
                    UserRole.ADMIN
                );
                log.info("Created admin account {}", email);
            }
        );
    }
}