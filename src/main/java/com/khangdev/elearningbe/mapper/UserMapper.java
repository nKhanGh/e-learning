package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.UserResponse;
import com.khangdev.elearningbe.entity.user.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
