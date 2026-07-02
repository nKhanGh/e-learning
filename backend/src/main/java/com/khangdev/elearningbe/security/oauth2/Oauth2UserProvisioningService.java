package com.khangdev.elearningbe.security.oauth2;

import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.entity.user.UserProfile;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Oauth2UserProvisioningService {
    static String DEFAULT_AVATAR_FILE_NAME = "default_avatar.jpg";

    UserRepository userRepository;
    RestClient githubRestClient = RestClient.builder()
            .baseUrl("https://api.github.com")
            .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
            .build();

    public User provisionUser(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        Oauth2Profile profile = normalizeProfile(userRequest, oauth2User);

        User user = userRepository.findByEmail(profile.email())
                .map(existingUser -> updateExistingUser(existingUser, profile))
                .orElseGet(() -> createUser(profile));

        return userRepository.save(user);
    }

    private User updateExistingUser(User user, Oauth2Profile profile) {
        if (user.getStatus() == UserStatus.PENDING || user.getStatus() == UserStatus.VERIFIED) {
            user.setStatus(UserStatus.ACTIVE);
        }
        if (isBlank(user.getFirstName())) {
            user.setFirstName(profile.firstName());
        }
        if (isBlank(user.getLastName())) {
            user.setLastName(profile.lastName());
        }
        if (user.getProfile() == null) {
            user.setProfile(createProfile(user));
        }
        return user;
    }

    private User createUser(Oauth2Profile profile) {
        User user = User.builder()
                .email(profile.email())
                .firstName(profile.firstName())
                .lastName(profile.lastName())
                .password(null)
                .status(UserStatus.ACTIVE)
                .build();
        user.setProfile(createProfile(user));
        return user;
    }

    private UserProfile createProfile(User user) {
        return UserProfile.builder()
                .user(user)
                .avatarFileName(DEFAULT_AVATAR_FILE_NAME)
                .build();
    }

    private Oauth2Profile normalizeProfile(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        return switch (provider) {
            case "google" -> normalizeGoogleProfile(oauth2User);
            case "github" -> normalizeGithubProfile(userRequest, oauth2User);
            default -> throw new AppException(ErrorCode.EMAIL_INVALID);
        };
    }

    private Oauth2Profile normalizeGoogleProfile(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");

        return buildProfile(email, firstName, lastName, "Google User");
    }

    private Oauth2Profile normalizeGithubProfile(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String email = Optional.ofNullable((String) oauth2User.getAttribute("email"))
                .orElseGet(() -> fetchGithubPrimaryEmail(userRequest.getAccessToken().getTokenValue()));
        String name = oauth2User.getAttribute("name");
        String login = oauth2User.getAttribute("login");
        String fallbackName = isBlank(login) ? "GitHub User" : login;

        return buildProfile(email, extractFirstName(name, fallbackName), extractLastName(name), fallbackName);
    }

    private String fetchGithubPrimaryEmail(String accessToken) {
        List<Map<String, Object>> emails = githubRestClient.get()
                .uri("/user/emails")
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

        if (emails == null) {
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }

        return emails.stream()
                .filter(email -> Boolean.TRUE.equals(email.get("primary")))
                .filter(email -> Boolean.TRUE.equals(email.get("verified")))
                .map(email -> (String) email.get("email"))
                .filter(email -> !isBlank(email))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_INVALID));
    }

    private Oauth2Profile buildProfile(String email, String firstName, String lastName, String fallbackName) {
        if (isBlank(email)) {
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }

        String normalizedFirstName = isBlank(firstName) ? fallbackName : firstName.trim();
        String normalizedLastName = isBlank(lastName) ? "" : lastName.trim();
        return new Oauth2Profile(email.trim(), normalizedFirstName, normalizedLastName);
    }

    private String extractFirstName(String fullName, String fallbackName) {
        if (isBlank(fullName)) {
            return fallbackName;
        }
        return fullName.trim().split("\\s+", 2)[0];
    }

    private String extractLastName(String fullName) {
        if (isBlank(fullName)) {
            return "";
        }
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : "";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record Oauth2Profile(String email, String firstName, String lastName) {
    }
}
