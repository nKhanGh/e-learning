package com.khangdev.elearningbe.service.common;

import com.khangdev.elearningbe.entity.user.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;

import java.text.ParseException;

public interface JwtService {

    String generateToken(User user, boolean isAccess) throws JOSEException;
    SignedJWT verifyToken(String token, boolean isAccess) throws JOSEException, ParseException;
}
