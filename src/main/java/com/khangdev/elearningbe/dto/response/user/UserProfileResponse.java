package com.khangdev.elearningbe.dto.response.user;

import com.khangdev.elearningbe.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String avatarUrl;
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
    private Boolean notificationEmail;
    private Boolean notificationPush;
}
