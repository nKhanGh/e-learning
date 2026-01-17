package com.khangdev.elearningbe.security.oauth2;

import com.khangdev.elearningbe.dto.request.authentication.RegisterRequest;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomOauth2UserService extends DefaultOAuth2UserService {
    UserService userService;
    UserRepository userRepository;


    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        try{
            OAuth2User oauth2User = super.loadUser(request);
            String email = oauth2User.getAttribute("email");
            String givenName = oauth2User.getAttribute("given_name");   // firstName
            String familyName = oauth2User.getAttribute("family_name");
            if(email == null) {
                throw new AppException(ErrorCode.EMAIL_INVALID);
            }
            var user = userRepository.findByEmail(email);
            if(user.isEmpty()){
                String firstName = givenName != null ? givenName : "";
                String lastName = familyName != null ? familyName : "";
                userService.register(RegisterRequest.builder()
                        .email(email)
                        .password("")
                        .firstName(firstName)
                        .lastName(lastName)
                        .status(UserStatus.VERIFIED)
                        .build()
                );
            } else if (user.get().getStatus() == UserStatus.PENDING) {
                user.get().setStatus(UserStatus.VERIFIED);
                userRepository.save(user.get());
            }
            return new CustomOauth2User(oauth2User, email);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load OAuth2 user", e);
        }
    }


}
