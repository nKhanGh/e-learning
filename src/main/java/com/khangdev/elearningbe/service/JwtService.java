package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.entity.user.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.KeyLengthException;
import com.nimbusds.jwt.SignedJWT;

import java.text.ParseException;

public interface JwtService {

    String generateToken(User user, boolean isAccess) throws JOSEException;
    SignedJWT verifyToken(String token, boolean isAccess) throws JOSEException, ParseException;
}
