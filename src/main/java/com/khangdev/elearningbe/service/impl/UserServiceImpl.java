package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.InstructorCreationRequest;
import com.khangdev.elearningbe.dto.request.RegisterRequest;
import com.khangdev.elearningbe.dto.request.UserUpdateRequest;
import com.khangdev.elearningbe.dto.response.UserResponse;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.entity.user.UserProfile;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.InstructorMapper;
import com.khangdev.elearningbe.mapper.UserMapper;
import com.khangdev.elearningbe.mapper.UserProfileMapper;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.InstructorRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    UserProfileMapper  userProfileMapper;
    InstructorMapper instructorMapper;
    PasswordEncoder passwordEncoder;
    EnrollmentRepository enrollmentRepository;
    InstructorRepository instructorRepository;


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
            user.setPhoneNumber(request.getPhone());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
        }
        else {
            user = User.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhone())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .status(request.getStatus() != null ? request.getStatus() : UserStatus.PENDING)
                    .build();
            UserProfile profile = createProfile(user);
            user.setProfile(profile);
        }
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    private UserProfile createProfile(User user) {
        return UserProfile.builder()
                .user(user)
                .avatarUrl("https://learnio-file.s3.ap-southeast-2.amazonaws.com/avatar/default-avatar.jpg")
                .build();
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

    @Override
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserResponse update(UUID userId, UserUpdateRequest request, MultipartFile avatarFile) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userMapper.updateUser(user, request);
        if(user.getProfile() == null) {
            user.setProfile(createProfile(user));
        }
        userProfileMapper.updateUserProfile(user.getProfile(), request.getProfileUpdateRequest());
        if(user.getInstructor() != null)
            instructorMapper.updateInstructor(user.getInstructor(), request.getInstructorUpdateRequest());
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        return userMapper.toResponse(userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
    }

    @Override
    public PageResponse<UserResponse> getUserInCourse(UUID courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> result = enrollmentRepository.findUsersByCourseId(courseId, pageable);
        return PageResponse.<UserResponse>builder()
                .page(page)
                .size(result.getSize())
                .items(result.getContent().stream().map(userMapper::toResponse).toList())
                .totalElements(result.getTotalElements())
                .build();
    }

    @Override
    public UserResponse createInstructor(InstructorCreationRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Instructor instructor = instructorMapper.toInstructor(request);
        instructor.setUser(user);
        user.setInstructor(instructor);
        instructorRepository.save(instructor);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }
}
