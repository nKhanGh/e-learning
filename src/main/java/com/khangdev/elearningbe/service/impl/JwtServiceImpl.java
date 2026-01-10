package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.service.JwtService;
import com.khangdev.elearningbe.service.RedisService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtServiceImpl implements JwtService {

    RedisService redisService;

    @NonFinal
    @Value("${jwt.signerKey}")
    String jwtSignerKey;

    @NonFinal
    @Value("${jwt.accessDuration}")
    long jwtAccessDuration;

    @NonFinal
    @Value("${jwt.refreshDuration}")
    long jwtRefreshDuration;


    @Override
    public String generateToken(User user, boolean isAccess) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .jwtID(UUID.randomUUID().toString())
                .issuer("learnio.com")
                .subject(user.getEmail())
                .issueTime(new Date())
                .expirationTime(Date.from(
                        Instant.now().plus(isAccess ? jwtAccessDuration : jwtRefreshDuration, ChronoUnit.SECONDS)
                ))
                .claim("scope", user.getRole() != null ? user.getRole().toString() : "GUEST")
                .claim("token_type", isAccess ? "access" : "refresh")
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        jwsObject.sign(new MACSigner(jwtSignerKey.getBytes()));
        return jwsObject.serialize();
    }

    @Override
    public SignedJWT verifyToken(String token, boolean isAccess) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(jwtSignerKey.getBytes());

        SignedJWT jwt = SignedJWT.parse(token);

        String tokenType = (String) jwt.getJWTClaimsSet().getClaim("token_type");
        if(isAccess && tokenType.equals("refresh")) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Date expiryDate = jwt.getJWTClaimsSet().getExpirationTime();

        var verified = jwt.verify(jwsVerifier);

        String id = "auth:blacklist:" + jwt.getJWTClaimsSet().getJWTID();

        if (!verified || expiryDate.before(new Date())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (redisService.hasKey(id))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return jwt;


    }
}
