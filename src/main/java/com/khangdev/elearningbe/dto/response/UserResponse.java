package com.khangdev.elearningbe.dto.response;

import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.UserProfile;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserRole role;
    private UserStatus status;
    private boolean emailVerified;
    private Instant emailVerifiedAt;
    private boolean twoFactorEnabled;
    private String twoFactorSecret;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private Integer failedLoginAttempts = 0;
    private LocalDateTime lockedUntil;
    private UserProfileResponse profile;
    private InstructorResponse instructor;
}
