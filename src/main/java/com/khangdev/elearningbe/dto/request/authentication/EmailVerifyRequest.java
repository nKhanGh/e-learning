package com.khangdev.elearningbe.dto.request.authentication;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerifyRequest {
    @Email
    private String email;

    @Size(min = 6, max = 6, message = "VERIFY_CODE_INVALID")
    private String verifyCode;
}
