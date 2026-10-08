package org.example.backend.auth.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.backend.auth.config.JwtProperties;
import org.example.backend.core.entity.User;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ROLE = "role";

    private final SecretKey signingKey;
    private final Duration expiration;

    public JwtService(JwtProperties properties) {
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.expiration = Duration.ofMillis(properties.expiration());
    }

    public String generateToken(User user)
    {
        Instant now = Instant.now();

        return Jwts.builder()
            .subject(String.valueOf(user.getId()))
            .claim(CLAIM_EMAIL, user.getEmail())
            .claim(CLAIM_ROLE, user.getRole().name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(expiration)))
            .signWith(signingKey)
            .compact();
    }

    public Integer extractUserId(String token) {
        String subject = Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();

        return Integer.valueOf(subject);
    }

    public long getExpirationSeconds() {
        return expiration.toSeconds();
    }
}