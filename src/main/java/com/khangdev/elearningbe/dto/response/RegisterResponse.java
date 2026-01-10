package com.khangdev.elearningbe.dto.response;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private String firstName;
    private String lastName;
    @Email
    private String email;
    private String phone;
}
