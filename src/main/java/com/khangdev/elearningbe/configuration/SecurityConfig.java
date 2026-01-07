package com.khangdev.elearningbe.configuration;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SecurityConfig {

    private static final String[] whiteList = {
            "/auth/login", "/auth/logout", "/auth/verify-email",
            "/users",
            "/auth/introspect", "auth/refreshToken",
            "/job-seekers",
            "/recruiters",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
            "/addresses/**",
            "/jobs/**",
            "/industries/**",
            "/dashboard/**",
            "/ws/**",
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth ->auth.
                        requestMatchers(whiteList).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }

}
