package com.khangdev.elearningbe.dto.request;

import com.khangdev.elearningbe.enums.Gender;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.File;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String bio;
    private String headline;
    private String websiteUrl;
    private String linkedinUrl;
    private String twitterUrl;
    private String facebookUrl;
    private String githubUrl;
    private Instant dateOfBirth;
    private Gender gender;
    private String country;
    private String city;
    private String timezone;
    private String language;
    private Boolean notificationEmail = true;
    private Boolean notificationPush = true;
}
