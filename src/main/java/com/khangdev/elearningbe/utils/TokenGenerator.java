package com.khangdev.elearningbe.utils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.security.SecureRandom;
import java.util.Base64;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TokenGenerator {
    static SecureRandom random = new SecureRandom();
    static Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();

    public static String generateResetToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return encoder.encodeToString(bytes);
    }
}