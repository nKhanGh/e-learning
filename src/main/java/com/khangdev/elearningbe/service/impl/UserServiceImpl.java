package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.RegisterRequest;
import com.khangdev.elearningbe.dto.response.UserResponse;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.UserMapper;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;


    @Override
    public UserResponse register(RegisterRequest request) {
        Optional<User> oldUser = userRepository.findByEmail(request.getEmail());
        User user;
        if(oldUser.isPresent()){
            if (oldUser.get().getStatus() != UserStatus.PENDING)
                throw new AppException(ErrorCode.USER_EXISTED);
            user = oldUser.get();
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setStatus(UserStatus.PENDING);
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhone());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
        }
        else user = User.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhone())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .status(request.getStatus() != null ? request.getStatus() : UserStatus.PENDING)
                    .build();
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public void setStatus(String email, UserStatus status) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Override
    public void resetPassword(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    @Override
    public UserResponse getMyInfo() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }
}
