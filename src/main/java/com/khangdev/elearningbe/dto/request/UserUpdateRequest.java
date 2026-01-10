package com.khangdev.elearningbe.dto.request;

import com.khangdev.elearningbe.enums.UserStatus;
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
public class UserUpdateRequest {
    @Email
    String email;

    @Size(min = 8, max = 20)
    String phone;

    @NotBlank
    @NotNull
    String firstName;

    @NotBlank
    @NotNull
    String lastName;

    UserStatus status;
    ProfileUpdateRequest profileUpdateRequest;
    InstructorUpdateRequest instructorUpdateRequest;
}
