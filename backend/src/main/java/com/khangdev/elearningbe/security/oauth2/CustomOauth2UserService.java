package com.khangdev.elearningbe.security.oauth2;

import com.khangdev.elearningbe.entity.user.User;
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
    Oauth2UserProvisioningService oauth2UserProvisioningService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        try{
            OAuth2User oauth2User = super.loadUser(request);
            User user = oauth2UserProvisioningService.provisionUser(request, oauth2User);
            return new CustomOauth2User(oauth2User, user.getEmail());
        } catch (Exception e) {
            throw new RuntimeException("Failed to load OAuth2 user", e);
        }
    }


}
