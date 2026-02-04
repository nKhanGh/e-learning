package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.user.InstructorCreationRequest;
import com.khangdev.elearningbe.dto.request.user.InstructorUpdateRequest;
import com.khangdev.elearningbe.dto.request.user.ProfileUpdateRequest;
import com.khangdev.elearningbe.dto.request.user.UserUpdateRequest;
import com.khangdev.elearningbe.dto.response.user.InstructorResponse;
import com.khangdev.elearningbe.dto.response.user.UserProfileResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.enums.Gender;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.enums.VerificationStatus;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
 import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@SpringBootTest
@Slf4j
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private UserUpdateRequest userUpdateRequest;
    private InstructorCreationRequest  instructorCreationRequest;
    private UserResponse userResponse;

    @MockBean
    private UserService userService;

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
                .email("khang@gmail.com")
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
    }

    @Test
    void getMyInfo() throws Exception {

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);

        mockMvc.perform(
            MockMvcRequestBuilders
                .get("/users/my-info")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
        )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000))
        ;
    }

    @Test
    void createInstructor_validRequest_success() throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        String content = objectMapper.writeValueAsString(instructorCreationRequest);

        Mockito.when(userService.createInstructor(ArgumentMatchers.any()))
                        .thenReturn(userResponse);

        mockMvc.perform(
            MockMvcRequestBuilders
                .post("/users/instructor")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(content)
        )
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000))
        ;
    }

    @Test
    void getUserCourse() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(userService.getUserInCourse(ArgumentMatchers.any(UUID.class), ArgumentMatchers.anyInt(), ArgumentMatchers.anyInt()))
                .thenReturn(PageResponse.<UserResponse>builder()
                        .page(0)
                        .size(10)
                        .items(List.of(userResponse))
                        .totalPages(1)
                        .totalElements(1)
                        .build()
                );
        mockMvc.perform(
                MockMvcRequestBuilders
                        .get("/users/course/{courseId}", courseId.toString())
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
        ).andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getUserById() throws Exception {
        UUID userId = UUID.randomUUID();

        Mockito.when(userService.getUserById(ArgumentMatchers.any(UUID.class)))
                .thenReturn(userResponse);

        mockMvc.perform(
                MockMvcRequestBuilders
                        .get("/users/{userId}", userId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
        ).andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void deleteUser_success() throws Exception {
        UUID userId = UUID.randomUUID();

        Mockito.doNothing().when(userService).deleteUser(ArgumentMatchers.any(UUID.class));

        mockMvc.perform(
                MockMvcRequestBuilders.delete("/users/{userId}", userId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
        )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message")
                        .value("User deleted successfully!")
                );
    }

    @Test
    void updateMyProfile_noAvatar_success() throws Exception {
        UUID userId = UUID.randomUUID();

        userResponse.setId(userId);
        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(userUpdateRequest)
        );

        Mockito.when(userService.update(
                ArgumentMatchers.eq(userId),
                ArgumentMatchers.any(UserUpdateRequest.class),
                ArgumentMatchers.isNull()
        )).thenReturn(userResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.multipart("/users/my-profile")
                        .file(dataPart)
                        .with(req -> { req.setMethod("PUT"); return req;})
                        .contentType(MediaType.MULTIPART_FORM_DATA)
        ).andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void updateMyProfile_withAvatar_success() throws Exception {
        UUID userId = UUID.randomUUID();

        userResponse.setId(userId);
        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(userUpdateRequest)
        );

        MockMultipartFile avatarPart = new MockMultipartFile(
                "avatar",
                "avatar.png",
                "image/png",
                "fake-image-content".getBytes()
        );

        Mockito.when(userService.update(
                ArgumentMatchers.eq(userId),
                ArgumentMatchers.any(UserUpdateRequest.class),
                ArgumentMatchers.any(MultipartFile.class)
        )).thenReturn(userResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.multipart("/users/my-profile")
                .file(dataPart)
                        .file(avatarPart)
                .with(req -> { req.setMethod("PUT"); return req;})
                .contentType(MediaType.MULTIPART_FORM_DATA)
        ).andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void updateUser_noAvatar_success() throws Exception {
        UUID userId = UUID.randomUUID();

        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(userUpdateRequest)
        );

        Mockito.when(userService.update(
                ArgumentMatchers.eq(userId),
                ArgumentMatchers.any(UserUpdateRequest.class),
                ArgumentMatchers.isNull()
        )).thenReturn(userResponse);

        mockMvc.perform(MockMvcRequestBuilders
                        .multipart("/users/{userId}", userId.toString())
                        .file(dataPart)
                        .with(req -> { req.setMethod("PUT"); return req; }) // multipart default POST
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(1000));

        Mockito.verify(userService, Mockito.times(1))
                .update(ArgumentMatchers.eq(userId), ArgumentMatchers.any(UserUpdateRequest.class), ArgumentMatchers.isNull());
    }

    @Test
    void updateUser_withAvatar_success() throws Exception {
        UUID userId = UUID.randomUUID();

        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(userUpdateRequest)
        );

        MockMultipartFile avatarPart = new MockMultipartFile(
                "avatar",
                "avatar.png",
                "image/png",
                "fake-image-content".getBytes()
        );

        Mockito.when(userService.update(
                ArgumentMatchers.eq(userId),
                ArgumentMatchers.any(UserUpdateRequest.class),
                ArgumentMatchers.any(MultipartFile.class)
        )).thenReturn(userResponse);

        mockMvc.perform(MockMvcRequestBuilders
                        .multipart("/users/{userId}", userId.toString())
                        .file(dataPart)
                        .file(avatarPart)
                        .with(req -> { req.setMethod("PUT"); return req; })
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(1000));

        Mockito.verify(userService, Mockito.times(1))
                .update(ArgumentMatchers.eq(userId), ArgumentMatchers.any(UserUpdateRequest.class), ArgumentMatchers.any(MultipartFile.class));
    }



}
