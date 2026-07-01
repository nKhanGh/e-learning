package com.khangdev.elearningbe.configuration;

import com.khangdev.elearningbe.service.user.AuthenticationService;
import com.khangdev.elearningbe.service.common.JwtService;
import com.nimbusds.jose.JOSEException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;

@Component
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signerKey}")
    private String signerKey;

    private NimbusJwtDecoder jwtDecoder;

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    @PostConstruct
    public void init() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        this.jwtDecoder = NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            jwtService.verifyToken(token, true);
            return jwtDecoder.decode(token);
        } catch (ParseException | JOSEException e) {
            throw new BadJwtException("Invalid JWT: " + e.getMessage());
        }
    }
}
