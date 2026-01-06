package com.khangdev.elearningbe.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @Email
    String email;

    @Size(min = 8, max = 20)
    @NotNull
    @NotBlank
    String password;

    @Size(min = 8, max = 20)
    String phone;

    @NotBlank
    @NotNull
    String firstName;

    @NotBlank
    @NotNull
    String lastName;
}
