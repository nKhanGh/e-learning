package com.khangdev.elearningbe.entity.user;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends BaseEntity {

    @Id
    @Column(name = "user_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "avatar_file_name", length = 500)
    private String avatarFileName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String headline;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "twitter_url", length = 500)
    private String twitterUrl;

    @Column(name = "facebook_url", length = 500)
    private String facebookUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "date_of_birth")
    private Instant dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    @Column(length = 50)
    @Builder.Default
    private String timezone = "UTC";

    @Column(length = 10)
    @Builder.Default
    private String language = "en";

    @Column(name = "notification_email")
    @Builder.Default
    private Boolean notificationEmail = true;

    @Column(name = "notification_push")
    @Builder.Default
    private Boolean notificationPush = true;

}
