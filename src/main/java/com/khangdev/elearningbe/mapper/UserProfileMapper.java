package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.ProfileUpdateRequest;
import com.khangdev.elearningbe.dto.response.UserProfileResponse;
import com.khangdev.elearningbe.entity.user.UserProfile;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfileResponse toResponse(UserProfile userProfile);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserProfile(@MappingTarget UserProfile userProfile, ProfileUpdateRequest request);
}
