package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.LectureRepository;
import com.khangdev.elearningbe.service.common.FileService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@SpringBootTest(properties = {
        "file.uploadDir=target/test-uploads",
        "file.avatarDir=target/test-uploads/avatars",
        "file.video-dir=target/test-uploads/videos",
        "file.documentDir=target/test-uploads/docs",
        "file.chatDir=target/test-uploads/chat",
        "file.videoTokenSecret=test-secret",
        "file.videoTokenExpiration=60"
})
public class FileServiceTest {

    @Autowired
    private FileService fileService;

    @MockBean
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private LectureRepository lectureRepository;

    @Test
    void hasAccessPermission_success() {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        Course course = Course.builder().id(courseId).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(enrollmentRepository.existsById(Mockito.any(EnrollmentId.class)))
                .thenReturn(true);

        boolean result = fileService.hasAccessPermission(lectureId, userId);

        Assertions.assertThat(result).isTrue();
    }

    @Test
    void hasAccessPermission_lectureNotFound_throwException() {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> fileService.hasAccessPermission(lectureId, userId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.LECTURE_NOT_FOUND);
    }

    @Test
    void verifySignedUrl_expired_false() {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        boolean result = fileService.verifySignedUrl("file.mp4", lectureId, userId,
                Instant.now().minusSeconds(10).getEpochSecond(), "sig");

        Assertions.assertThat(result).isFalse();
    }

    @Test
    void verifySignedUrl_invalidSignature_false() {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        boolean result = fileService.verifySignedUrl("file.mp4", lectureId, userId,
                Instant.now().plusSeconds(60).getEpochSecond(), "invalid");

        Assertions.assertThat(result).isFalse();
    }

    @Test
    void verifySignedUrl_validSignature_noAccess_false() {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        Course course = Course.builder().id(courseId).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(enrollmentRepository.existsById(Mockito.any(EnrollmentId.class)))
                .thenReturn(false);

        String signedUrl = fileService.generateSignedUrl("file.mp4", lectureId, userId);
        String query = signedUrl.substring(signedUrl.indexOf('?') + 1);
        Map<String, String> map = Arrays.stream(query.split("&"))
                .map(p -> p.split("=", 2))
                .collect(Collectors.toMap(a -> a[0], a -> a[1]));
        long expires = Long.parseLong(map.get("expires"));
        String signature = map.get("signature");

        boolean result = fileService.verifySignedUrl("file.mp4", lectureId, userId, expires, signature);

        Assertions.assertThat(result).isFalse();
    }

    @Test
    void verifySignedUrl_validSignature_access_true() {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        Course course = Course.builder().id(courseId).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(enrollmentRepository.existsById(Mockito.any(EnrollmentId.class)))
                .thenReturn(true);

        String signedUrl = fileService.generateSignedUrl("file.mp4", lectureId, userId);
        String query = signedUrl.substring(signedUrl.indexOf('?') + 1);

        Map<String, String> map = Arrays.stream(query.split("&"))
                .map(p -> p.split("=", 2))
                .collect(Collectors.toMap(a -> a[0], a -> a[1]));
        long expires = Long.parseLong(map.get("expires"));
        String signature = map.get("signature");

        boolean result = fileService.verifySignedUrl("file.mp4", lectureId, userId, expires, signature);

        Assertions.assertThat(result).isTrue();
    }

    @Test
    void loadProtectedFile_notFound_throwException() {
        Assertions.assertThatThrownBy(() -> fileService.loadProtectedFile("missing.mp4", "video"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_NOT_FOUND);
    }

    @Test
    void loadAvatarFile_notFound_throwException() {
        Assertions.assertThatThrownBy(() -> fileService.loadAvatarFile("missing.png"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_NOT_FOUND);
    }

    @Test
    void deleteFile_invalidType_throwException() {
        Assertions.assertThatThrownBy(() -> fileService.deleteFile("file.png", "invalid"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_FILE_TYPE);
    }

    @Test
    void uploadAvatar_empty_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(true);

        Assertions.assertThatThrownBy(() -> fileService.uploadAvatar(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_EMPTY);
    }

    @Test
    void uploadAvatar_invalidType_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(false);
        Mockito.when(file.getContentType()).thenReturn("text/plain");
        Mockito.when(file.getSize()).thenReturn(10L);

        Assertions.assertThatThrownBy(() -> fileService.uploadAvatar(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_FILE_TYPE);
    }

    @Test
    void uploadAvatar_tooLarge_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(false);
        Mockito.when(file.getContentType()).thenReturn("image/png");
        Mockito.when(file.getSize()).thenReturn(6L * 1024 * 1024);

        Assertions.assertThatThrownBy(() -> fileService.uploadAvatar(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_TOO_LARGE);
    }

    @Test
    void uploadVideo_empty_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(true);

        Assertions.assertThatThrownBy(() -> fileService.uploadVideo(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_EMPTY);
    }

    @Test
    void uploadVideo_invalidType_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(false);
        Mockito.when(file.getContentType()).thenReturn("image/png");
        Mockito.when(file.getSize()).thenReturn(10L);

        Assertions.assertThatThrownBy(() -> fileService.uploadVideo(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_FILE_TYPE);
    }

    @Test
    void uploadVideo_tooLarge_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(false);
        Mockito.when(file.getContentType()).thenReturn("video/mp4");
        Mockito.when(file.getSize()).thenReturn(501L * 1024 * 1024);

        Assertions.assertThatThrownBy(() -> fileService.uploadVideo(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_TOO_LARGE);
    }

    @Test
    void uploadDocument_empty_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(true);

        Assertions.assertThatThrownBy(() -> fileService.uploadDocument(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_EMPTY);
    }

    @Test
    void uploadDocument_tooLarge_throwException() {
        MultipartFile file = Mockito.mock(MultipartFile.class);
        Mockito.when(file.isEmpty()).thenReturn(false);
        Mockito.when(file.getSize()).thenReturn(51L * 1024 * 1024);

        Assertions.assertThatThrownBy(() -> fileService.uploadDocument(file))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FILE_TOO_LARGE);
    }

    @Test
    void uploadChatFile_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "chat.txt",
                "text/plain",
                "hello".getBytes());

        String fileName = fileService.uploadChatFile(file);

        Path savedPath = Paths.get("target/test-uploads/chat").resolve(fileName);
        Assertions.assertThat(Files.exists(savedPath)).isTrue();
        Files.deleteIfExists(savedPath);
    }
}
