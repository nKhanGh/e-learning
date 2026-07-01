package com.khangdev.elearningbe.dto.response.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignedUrlResponse {
    private String signedUrl;
    private int expiresIn;
}
