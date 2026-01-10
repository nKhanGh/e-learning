package com.khangdev.elearningbe.dto.request.user;

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
    @NotBlank
    @NotNull
    String firstName;

    @NotBlank
    @NotNull
    String lastName;

    ProfileUpdateRequest profileUpdateRequest;
    InstructorUpdateRequest instructorUpdateRequest;
}
