package com.khangdev.elearningbe.configuration;

import com.khangdev.elearningbe.security.oauth2.CustomOauth2UserService;
import com.khangdev.elearningbe.security.oauth2.Oauth2LoginSuccessHandler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

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

    private static final String[] whiteList = {
            "/auth/login", "/auth/logout", "/auth/verify-email", "auth/register",
            "/auth/introspect", "auth/refreshToken",
            "/job-seekers",
            "/recruiters",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
            "/addresses/**",
            "/oauth2/**",
            "/jobs/**",
            "/industries/**",
            "/dashboard/**",
            "/ws/**",
            "/courses/search/**",
            "/files/**",
            "/uploads/**",
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth ->auth.
                        requestMatchers(whiteList).permitAll()
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
                            response.sendRedirect("http://localhost:5173/auth/error?error=" + exception.getMessage());
                        })
                )

                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .exceptionHandling(exceptionHandlingCustomize -> exceptionHandlingCustomize.accessDeniedHandler(customAccessDeniedHandler))
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
