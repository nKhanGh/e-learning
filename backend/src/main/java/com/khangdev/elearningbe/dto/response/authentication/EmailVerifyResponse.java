package com.khangdev.elearningbe.dto.response.authentication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerifyResponse {
    boolean valid;
    String accessToken;
    String refreshToken;
}
