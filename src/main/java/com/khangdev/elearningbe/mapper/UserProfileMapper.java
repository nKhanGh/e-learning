package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.UserProfileResponse;
import com.khangdev.elearningbe.entity.user.UserProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfileResponse toResponse(UserProfile userProfile);
}
