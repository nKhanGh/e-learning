package com.khangdev.elearningbe.configuration;

import com.khangdev.elearningbe.security.oauth2.CustomOauth2UserService;
import com.khangdev.elearningbe.security.oauth2.Oauth2LoginSuccessHandler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SecurityConfig {

    CustomJwtDecoder jwtDecoder;
    Oauth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    CustomOauth2UserService customOauth2UserService;
    CustomAccessDeniedHandler customAccessDeniedHandler;

    @NonFinal
    @Value("${app.frontendUrl}")
    String frontendBaseUrl;

    private static final String[] whiteListPost = {
            "/auth/login", "/auth/logout", "/auth/verify-email", "/auth/register",
            "/auth/introspect", "/auth/refresh-token", "/auth/refreshtToken",
            "/auth/resend-verification",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/courses/search", "/courses/search/**", "/api/courses/search",
            "/ws/**",
    };

    private static final String[] whiteListGet = {
            "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
            "/oauth2/**",
            "/login/oauth2/**",
            "/courses/search/**",
            "/files/**",
            "/uploads/**",
            "/course-categories/**",
            "/courses/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth ->auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, whiteListPost).permitAll()
                        .requestMatchers(HttpMethod.GET, whiteListGet).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwtCustomize -> jwtCustomize
                                .decoder(jwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter()
                                )
                        )
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOauth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            String message = UriUtils.encode(exception.getMessage(), StandardCharsets.UTF_8);
                            response.sendRedirect(frontendBaseUrl + "/auth/callback?status=error&message=" + message);
                        })
                )

                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .exceptionHandling(exceptionHandlingCustomize -> exceptionHandlingCustomize
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                        .accessDeniedHandler(customAccessDeniedHandler))
        ;

        return http.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

}
