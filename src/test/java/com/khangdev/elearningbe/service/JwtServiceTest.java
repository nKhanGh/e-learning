package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@SpringBootTest(properties = {
        "jwt.signerKey=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "jwt.accessDuration=3600",
        "jwt.refreshDuration=7200"
})
public class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    @MockBean
    private RedisService redisService;

    @Test
    void generateAndVerifyToken_success() throws Exception {
        User user = User.builder()
                .email("user@example.com")
                .role(UserRole.STUDENT)
                .build();

        String token = jwtService.generateToken(user, true);

        Mockito.when(redisService.hasKey(Mockito.anyString())).thenReturn(false);

        SignedJWT signedJWT = jwtService.verifyToken(token, true);

        Assertions.assertThat(signedJWT.getJWTClaimsSet().getSubject()).isEqualTo("user@example.com");
    }

    @Test
    void verifyToken_refreshUsedAsAccess_throwException() throws Exception {
        User user = User.builder()
                .email("user@example.com")
                .role(UserRole.STUDENT)
                .build();

        String token = jwtService.generateToken(user, false);

        Assertions.assertThatThrownBy(() -> jwtService.verifyToken(token, true))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void verifyToken_expired_throwException() throws Exception {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .jwtID(UUID.randomUUID().toString())
                .issuer("learnio.com")
                .subject("user@example.com")
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().minusSeconds(60)))
                .claim("scope", "STUDENT")
                .claim("token_type", "access")
                .build();

        JWSObject jwsObject = new JWSObject(new JWSHeader(JWSAlgorithm.HS512), new Payload(claimsSet.toJSONObject()));
        jwsObject.sign(new MACSigner("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".getBytes()));

        String token = jwsObject.serialize();

        Assertions.assertThatThrownBy(() -> jwtService.verifyToken(token, true))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void verifyToken_invalidSignature_throwException() throws Exception {
        User user = User.builder()
                .email("user@example.com")
                .role(UserRole.STUDENT)
                .build();

        String token = jwtService.generateToken(user, true);
        String tampered = token.substring(0, token.length() - 1) + (token.endsWith("a") ? "b" : "a");

        Assertions.assertThatThrownBy(() -> jwtService.verifyToken(tampered, true))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void verifyToken_blacklisted_throwException() throws Exception {
        User user = User.builder()
                .email("user@example.com")
                .role(UserRole.STUDENT)
                .build();

        String token = jwtService.generateToken(user, true);

        Mockito.when(redisService.hasKey(Mockito.anyString())).thenReturn(true);

        Assertions.assertThatThrownBy(() -> jwtService.verifyToken(token, true))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHENTICATED);
    }
}
