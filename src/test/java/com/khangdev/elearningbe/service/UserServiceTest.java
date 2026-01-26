package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.authentication.RegisterRequest;
import com.khangdev.elearningbe.dto.request.user.InstructorCreationRequest;
import com.khangdev.elearningbe.dto.request.user.InstructorUpdateRequest;
import com.khangdev.elearningbe.dto.request.user.ProfileUpdateRequest;
import com.khangdev.elearningbe.dto.request.user.UserUpdateRequest;
import com.khangdev.elearningbe.dto.response.user.InstructorResponse;
import com.khangdev.elearningbe.dto.response.user.UserProfileResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.entity.user.UserProfile;
import com.khangdev.elearningbe.enums.Gender;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.enums.VerificationStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.InstructorMapper;
import com.khangdev.elearningbe.mapper.UserMapper;
import com.khangdev.elearningbe.mapper.UserProfileMapper;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.InstructorRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class UserServiceTest {
    @Autowired
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserMapper userMapper;

    @MockBean
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private InstructorRepository instructorRepository;


    @MockBean
    private UserProfileMapper userProfileMapper;

    @MockBean
    private InstructorMapper instructorMapper;

    @MockBean
    private MultipartFile avatarFile;

    @MockBean
    private PasswordEncoder passwordEncoder;

    private UserUpdateRequest userUpdateRequest;
    private InstructorCreationRequest instructorCreationRequest;
    private UserResponse userResponse;
    private RegisterRequest registerRequest;
    private User user;

    @BeforeEach
    void initData() {
        ProfileUpdateRequest profileUpdateRequest = ProfileUpdateRequest.builder()
                .bio("acdasdfsa")
                .headline("12344556")
                .websiteUrl("https://google.com")
                .linkedinUrl("https://linkedin.com/in/khang")
                .twitterUrl("https://twitter.com/khang")
                .facebookUrl("https://facebook.com/khang")
                .githubUrl("https://github.com/khang")
                .dateOfBirth(Instant.now())
                .gender(Gender.MALE)
                .country("Vietnam")
                .city("Ho Chi Minh")
                .timezone("Asia/Ho_Chi_Minh")
                .language("vi")
                .notificationEmail(true)
                .notificationPush(true)
                .build();

        InstructorUpdateRequest instructorUpdateRequest = InstructorUpdateRequest.builder()
                .tagline("abd")
                .about("bcd")
                .teachingExperience("HCMUT")
                .credentials("abds")
                .specializations(List.of("Java", "JS"))
                .videoIntroUrl("https://youtube.com/watch?v=demo")
                .verificationDocuments(List.of("doc1.pdf", "doc2.pdf"))
                .verifiedAt(null)
                .verifiedBy(null)
                .payoutMethod("BANK_TRANSFER")
                .payoutDetails(List.of("VCB - 123456789", "Name: Nguyen Huu Khang"))
                .commissionRate(new BigDecimal("30.00"))
                .featured(false)
                .build();

        userUpdateRequest = UserUpdateRequest.builder()
                .firstName("Khang")
                .lastName("Nguyen Huu")
                .profileUpdateRequest(profileUpdateRequest)
                .instructorUpdateRequest(instructorUpdateRequest)
                .build();

        instructorCreationRequest =
                InstructorCreationRequest.builder()
                        .tagline("Experienced Java Instructor")
                        .about("10+ years experience in backend and system design")
                        .teachingExperience("HCMUT, Online Platforms")
                        .credentials("MSc Computer Science")
                        .specializations(List.of("Java", "Spring Boot", "System Design"))
                        .videoIntroUrl("https://youtube.com/watch?v=intro")
                        .verificationDocuments(List.of("degree.pdf", "certificate.pdf"))
                        .verifiedAt(null)
                        .verifiedBy(null)
                        .payoutMethod("BANK_TRANSFER")
                        .payoutDetails(List.of(
                                "Bank: Vietcombank",
                                "Account: 123456789",
                                "Name: Nguyen Huu Khang"
                        ))
                        .commissionRate(new BigDecimal("30.00"))
                        .featured(false)
                        .build();
        UserProfileResponse profileResponse = UserProfileResponse.builder()
                .avatarUrl("https://cdn.example.com/avatar/khang.png")
                .bio("Backend developer & instructor")
                .headline("Java/Spring Boot | System Design")
                .websiteUrl("https://google.com")
                .linkedinUrl("https://linkedin.com/in/khang")
                .twitterUrl("https://twitter.com/khang")
                .facebookUrl("https://facebook.com/khang")
                .githubUrl("https://github.com/khang")
                .dateOfBirth(Instant.parse("2002-01-01T00:00:00Z"))
                .gender(Gender.MALE)
                .country("Vietnam")
                .city("Ho Chi Minh")
                .timezone("Asia/Ho_Chi_Minh")
                .language("vi")
                .notificationEmail(true)
                .notificationPush(true)
                .build();

        InstructorResponse instructorResponse = InstructorResponse.builder()
                .tagline("Experienced Java Instructor")
                .about("10+ years teaching Java and Spring Boot")
                .teachingExperience("HCMUT, Udemy")
                .credentials("MSc Computer Science")
                .specializations(List.of("Java", "Spring Boot", "System Design"))
                .videoIntroUrl("https://youtube.com/watch?v=intro")
                .verificationStatus(VerificationStatus.PENDING)
                .verificationDocuments(List.of("degree.pdf", "certificate.pdf"))
                .verifiedAt(null)
                .verifiedBy(null)
                .totalStudents(1200)
                .totalCourses(12)
                .totalReviews(340)
                .averageRating(new BigDecimal("4.80"))
                .totalEarnings(new BigDecimal("15000.00"))
                .payoutMethod("BANK_TRANSFER")
                .payoutDetails(List.of(
                        "Bank: Vietcombank",
                        "Account: 123456789",
                        "Name: Nguyen Huu Khang"
                ))
                .commissionRate(new BigDecimal("30.00"))
                .featured(false)
                .build();

        userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("khanghuu849@gmail.com")
                .firstName("Khang")
                .lastName("Nguyen Huu")
                .phoneNumber("0123456789")
                .role(UserRole.INSTRUCTOR)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .emailVerifiedAt(Instant.now())
                .twoFactorEnabled(false)
                .twoFactorSecret(null)
                .lastLoginAt(LocalDateTime.now())
                .lastLoginIp("127.0.0.1")
                .failedLoginAttempts(0)
                .lockedUntil(null)
                .profile(profileResponse)
                .instructor(instructorResponse)
                .build();

        registerRequest = RegisterRequest.builder()
                .email("khanghuu849@gmail.com")
                .password("khanghuu849")
                .phone("0123456789")
                .firstName("Khang")
                .lastName("Nguyen Huu")
                .status(UserStatus.ACTIVE)
                .build();

        UserProfile profile = UserProfile.builder()
                .id(UUID.randomUUID())
                .avatarFileName("https://cdn.example.com/avatar/khang.png")
                .bio("Backend developer & instructor")
                .headline("Java/Spring Boot | System Design")
                .websiteUrl("https://google.com")
                .linkedinUrl("https://linkedin.com/in/khang")
                .twitterUrl("https://twitter.com/khang")
                .facebookUrl("https://facebook.com/khang")
                .githubUrl("https://github.com/khang")
                .dateOfBirth(Instant.parse("2002-01-01T00:00:00Z"))
                .gender(Gender.MALE)
                .country("Vietnam")
                .city("Ho Chi Minh")
                .timezone("Asia/Ho_Chi_Minh")
                .language("vi")
                .notificationEmail(true)
                .notificationPush(true)
                .build();

        Instructor instructor = Instructor.builder()
                .tagline("Experienced Java Instructor")
                .about("10+ years teaching Java and Spring Boot")
                .teachingExperience("HCMUT, Udemy")
                .credentials("MSc Computer Science")
                .specializations(List.of("Java", "Spring Boot", "System Design"))
                .videoIntroUrl("https://youtube.com/watch?v=intro")
                .verificationStatus(VerificationStatus.PENDING)
                .verificationDocuments(List.of("degree.pdf", "certificate.pdf"))
                .verifiedAt(null)
                .verifiedBy(null)
                .totalStudents(1200)
                .totalCourses(12)
                .totalReviews(340)
                .averageRating(new BigDecimal("4.80"))
                .totalEarnings(new BigDecimal("15000.00"))
                .payoutMethod("BANK_TRANSFER")
                .payoutDetails(List.of(
                        "Bank: Vietcombank",
                        "Account: 123456789",
                        "Name: Nguyen Huu Khang"
                ))
                .commissionRate(new BigDecimal("30.00"))
                .featured(false)
                .build();

        user = User.builder()
                .id(UUID.randomUUID())
                .email("khanghuu849@gmail.com")
                .firstName("Khang")
                .lastName("Nguyen Huu")
                .phoneNumber("0123456789")
                .role(UserRole.INSTRUCTOR)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .emailVerifiedAt(Instant.now())
                .twoFactorEnabled(false)
                .twoFactorSecret(null)
                .lastLoginAt(LocalDateTime.now())
                .lastLoginIp("127.0.0.1")
                .failedLoginAttempts(0)
                .lockedUntil(null)
                .profile(profile)
                .instructor(instructor)
                .build();


        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getEmail(), null)
        );
    }


    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }


    @Test
    void register_emailNotExists_success() {
        Mockito.when(userRepository.findByEmail(registerRequest.getEmail()))
                .thenReturn(Optional.empty());

        Mockito.when(passwordEncoder.encode(registerRequest.getPassword()))
                .thenReturn("encoded-password");


        Mockito.when(userMapper.toResponse(ArgumentMatchers.any(User.class)))
                .thenReturn(userResponse);

        var response = userService.register(registerRequest);

        Assertions.assertThat(response.getEmail()).isEqualTo(registerRequest.getEmail());
        Assertions.assertThat(response.getFirstName()).isEqualTo(registerRequest.getFirstName());
        Assertions.assertThat(response.getLastName()).isEqualTo(registerRequest.getLastName());

        Mockito.verify(userRepository).save(ArgumentMatchers.any(User.class));
    }

    @Test
    void register_userExistsAndNotPending_throwUserExisted() {
        User oldUser = User.builder()
                .email(registerRequest.getEmail())
                .status(UserStatus.ACTIVE)
                .build();

        Mockito.when(userRepository.findByEmail(registerRequest.getEmail()))
                .thenReturn(Optional.of(oldUser));

        Assertions.assertThatThrownBy(() -> userService.register(registerRequest))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.USER_EXISTED);

        Mockito.verify(userRepository, Mockito.never()).save(ArgumentMatchers.any());
    }


    @Test
    void register_userExistsAndPending_updateAndSuccess() {
        User oldUser = User.builder()
                .email(registerRequest.getEmail())
                .status(UserStatus.PENDING)
                .build();

        Mockito.when(userRepository.findByEmail(registerRequest.getEmail()))
                .thenReturn(Optional.of(oldUser));

        Mockito.when(passwordEncoder.encode(registerRequest.getPassword()))
                .thenReturn("encoded-password");

        UserResponse expectedResponse = UserResponse.builder()
                .email(registerRequest.getEmail())
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .build();

        Mockito.when(userMapper.toResponse(oldUser)).thenReturn(expectedResponse);

        var response = userService.register(registerRequest);

        Assertions.assertThat(response.getEmail()).isEqualTo(registerRequest.getEmail());
        Assertions.assertThat(oldUser.getFirstName()).isEqualTo(registerRequest.getFirstName());
        Assertions.assertThat(oldUser.getLastName()).isEqualTo(registerRequest.getLastName());
        Assertions.assertThat(oldUser.getPhoneNumber()).isEqualTo(registerRequest.getPhone());
        Assertions.assertThat(oldUser.getPassword()).isEqualTo("encoded-password");

        Mockito.verify(userRepository).save(oldUser);
    }

    @Test
    void getMyInfo_success(){
        Mockito.when(userRepository.findByEmail(user.getEmail())
                ).thenReturn(Optional.of(user));
        Mockito.when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        var response = userService.getMyInfo();

        Assertions.assertThat(response.getEmail()).isEqualTo(user.getEmail());
        Mockito.verify(userRepository).findByEmail(user.getEmail());
        Mockito.verify(userMapper).toResponse(user);
    }

    @Test
    void getMyInfo_fail(){
        Mockito.when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.empty());
        Assertions.assertThatThrownBy(() -> userService.getMyInfo())
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
        .isEqualTo(ErrorCode.USER_NOT_FOUND);

        Mockito.verify(userRepository).findByEmail(user.getEmail());
        Mockito.verify(userMapper, Mockito.never()).toResponse(Mockito.any());
    }

    @Test
    void deleteUser_success() {
        UUID id = UUID.randomUUID();

        Mockito.doNothing().when(userRepository).deleteById(id);

        userService.deleteUser(id);

        Mockito.verify(userRepository).deleteById(id);
    }

    @Test
    void update_success_userHasProfileAndNoInstructor() {
        UUID userId = UUID.randomUUID();
        user.setInstructor(null);
        user.setId(userId);
        userResponse.setId(userId);

        Mockito.when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        Mockito.when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        var result = userService.update(userId, userUpdateRequest, avatarFile);

        Assertions.assertThat(result.getId()).isEqualTo(user.getId());

        Mockito.verify(userRepository).findById(userId);
        Mockito.verify(userMapper).updateUser(user, userUpdateRequest);
        Mockito.verify(userProfileMapper).updateUserProfile(user.getProfile(), userUpdateRequest.getProfileUpdateRequest());
        Mockito.verify(instructorMapper, Mockito.never()).updateInstructor(Mockito.any(), Mockito.any());
        Mockito.verify(userRepository).save(user);
        Mockito.verify(userMapper).toResponse(user);
    }

    @Test
    void update_success_userHasNoProfile_shouldCreateProfile() {
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        user.setProfile(null); // quan trọng
        userResponse.setId(userId);

        userUpdateRequest.setProfileUpdateRequest(null);

        Mockito.when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        Mockito.when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        var result = userService.update(userId, userUpdateRequest, avatarFile);

        Assertions.assertThat(result.getId()).isEqualTo(user.getId());
        Assertions.assertThat(user.getProfile()).isNotNull(); // đã được createProfile()

        Mockito.verify(userMapper).updateUser(user, userUpdateRequest);
        Mockito.verify(userProfileMapper).updateUserProfile(Mockito.any(UserProfile.class), Mockito.eq(userUpdateRequest.getProfileUpdateRequest()));
        Mockito.verify(userRepository).save(user);
    }


    @Test
    void update_success_userHasInstructor_shouldUpdateInstructor() {
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        userResponse.setId(userId);

        Mockito.when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));
        Mockito.when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        var result = userService.update(userId, userUpdateRequest, avatarFile);

        Assertions.assertThat(result.getId()).isEqualTo(user.getId());

        Mockito.verify(instructorMapper).updateInstructor(user.getInstructor(), userUpdateRequest.getInstructorUpdateRequest());
        Mockito.verify(userRepository).save(user);
    }


    @Test
    void update_userNotFound_throwException() {
        UUID userId = UUID.randomUUID();

        Mockito.when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> userService.update(userId, userUpdateRequest, avatarFile))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        ;

        Mockito.verify(userRepository).findById(userId);
        Mockito.verify(userRepository, Mockito.never()).save(Mockito.any());
    }






    @Test
    void getUserById_success() {
        UUID id = UUID.randomUUID();
        user.setId(id);
        userResponse.setId(id);

        Mockito.when(userRepository.findById(id))
                .thenReturn(Optional.of(user));
        Mockito.when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        var result = userService.getUserById(id);

        Assertions.assertThat(result.getEmail()).isEqualTo(user.getEmail());
        Assertions.assertThat(result.getId()).isEqualTo(id);
        Mockito.verify(userRepository).findById(id);
        Mockito.verify(userMapper).toResponse(user);
    }

    @Test
    void getUserById_notFound_throwException() {
        UUID id = UUID.randomUUID();

        Mockito.when(userRepository.findById(id))
                .thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> userService.getUserById(id))
                .isInstanceOf(AppException.class);

        Mockito.verify(userRepository).findById(id);
        Mockito.verify(userMapper, Mockito.never()).toResponse(Mockito.any());
    }


    @Test
    void getUserInCourse_success() {
        UUID courseId = UUID.randomUUID();

        int page = 0;
        int size = 10;

        List<User> users = List.of(user);
        Page<User> userPage = new PageImpl<>(users, PageRequest.of(page, size), 1);

        Mockito.when(enrollmentRepository.findUsersByCourseId(Mockito.eq(courseId), Mockito.any(Pageable.class)))
                .thenReturn(userPage);

        Mockito.when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        PageResponse<UserResponse> result = userService.getUserInCourse(courseId, page, size);

        Assertions.assertThat(result.getPage()).isEqualTo(page);
        Assertions.assertThat(result.getSize()).isEqualTo(size);
        Assertions.assertThat(result.getTotalElements()).isEqualTo(1);
        Assertions.assertThat(result.getItems()).hasSize(1);
        Assertions.assertThat(result.getItems().get(0).getEmail()).isEqualTo(user.getEmail());

        Mockito.verify(enrollmentRepository).findUsersByCourseId(Mockito.eq(courseId), Mockito.any(Pageable.class));
        Mockito.verify(userMapper).toResponse(user);
    }

    @Test
    void createInstructor_success() {

        Mockito.when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(user));

        Instructor instructor = Instructor.builder().build();
        Mockito.when(instructorMapper.toInstructor(instructorCreationRequest))
                .thenReturn(instructor);

        Mockito.when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        var result = userService.createInstructor(instructorCreationRequest);

        Assertions.assertThat(result.getEmail()).isEqualTo(user.getEmail());
        Assertions.assertThat(user.getRole()).isEqualTo(UserRole.INSTRUCTOR);
        Assertions.assertThat(user.getInstructor()).isNotNull();
        Assertions.assertThat(user.getInstructor().getUser()).isEqualTo(user);

        Mockito.verify(instructorRepository).save(instructor);
        Mockito.verify(userRepository).save(user);
        Mockito.verify(userMapper).toResponse(user);
    }

    @Test
    void createInstructor_userNotFound_throwException() {
        Mockito.when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> userService.createInstructor(instructorCreationRequest))
                .isInstanceOf(AppException.class);

        Mockito.verify(instructorRepository, Mockito.never()).save(Mockito.any());
        Mockito.verify(userRepository, Mockito.never()).save(Mockito.any());
    }



}
