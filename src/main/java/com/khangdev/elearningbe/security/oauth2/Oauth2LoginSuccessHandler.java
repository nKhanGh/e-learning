package com.khangdev.elearningbe.security.oauth2;

import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.JwtService;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Oauth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    JwtService jwtService;
    UserRepository userRepository;

    @NonFinal
    @Value("${app.frontendUrl}")
    String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException{
        if(authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            String email = oAuth2User.getAttribute("email");
            userRepository.findByEmail(email).ifPresentOrElse(
                    user -> {
                        try {
                            handleUser(response, user);
                        } catch (IOException | JOSEException e) {
                            throw new RuntimeException(e);
                        }
                    },
                    () -> {
                        try {
                            redirectWithError(response, "USER_NOT_FOUND");
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }
            );
        } else {
            redirectWithError(response, "unknown_principal_type");
        }
    }

    private void handleUser(HttpServletResponse response, User user) throws IOException, JOSEException {
        Map<String, String> params = new HashMap<>();
        switch(user.getStatus()) {
            case ACTIVE -> {
                params.put("status", "ACTIVE");
                params.put("accessToken", jwtService.generateToken(user, true));
                params.put("refreshToken", jwtService.generateToken(user, false));
            }
            case VERIFIED -> {
                params.put("status", "VERIFIED");
                params.put("accessToken", jwtService.generateToken(user, true));
                params.put("refreshToken", jwtService.generateToken(user, false));
            }
            default -> params.put("status", user.getStatus().toString());
        }

        String url = buildRedirectUrl("/auth/callback", params);
        response.sendRedirect(url);
    }

    private void redirectWithError(HttpServletResponse response, String errorMessage) throws IOException {
        String url = buildRedirectUrl("/auth/callback", Map.of("status", "error", "message", errorMessage));
        response.sendRedirect(url);
    }

    private String buildRedirectUrl(String path, Map<String, String> params){
        String paramString = params.entrySet().stream()
                .map(entry ->
                        entry.getKey() + "=" + UriUtils.encode(entry.getValue(), StandardCharsets.UTF_8)
                )
                .collect(Collectors.joining("&"));
        return frontendBaseUrl + path + "?" + paramString;
    }
}
