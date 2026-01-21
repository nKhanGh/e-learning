package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.LectureRepository;
import com.khangdev.elearningbe.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    @Value("${file.uploadDir}")
    private String uploadDir;

    @Value("${file.avatarDir}")
    private String avatarDir;

    @Value("${file.video-dir}")
    private String videoDir;

    @Value("${file.documentDir}")
    private String documentDir;

    @Value("${file.videoTokenSecret}")
    private String urlSigningKey;

    @Value("${file.videoTokenExpiration}")
    private int videoTokenExpiration;

    private final EnrollmentRepository enrollmentRepository;
    private final LectureRepository  lectureRepository;

    @Override
    public String uploadAvatar(MultipartFile file) throws IOException {
        validateImageFile(file);
        return saveFile(file, avatarDir, "avatar");
    }

    @Override
    public String uploadVideo(MultipartFile file) throws IOException {
        validateVideoFile(file);
        return saveFile(file, videoDir, "video");
    }

    @Override
    public String uploadDocument(MultipartFile file) throws IOException {
        validateDocumentFile(file);
        return saveFile(file, documentDir, "doc");
    }

    @Override
    public String generateSignedUrl(String fileName, UUID lectureId, UUID userId) {
        long expiryTime = Instant.now().plusSeconds(videoTokenExpiration).getEpochSecond();
        String signature = generateSignature(fileName, lectureId, userId, expiryTime);
        return String.format("/api/files/protected/%s?lectureId=%s&userId=%s&expires=%d&signature=%s",
                fileName, lectureId, userId, expiryTime, signature);
    }

    @Override
    public boolean verifySignedUrl(String fileName, UUID lectureId, UUID userId, long expiryTime, String signature) {
        if (Instant.now().getEpochSecond() > expiryTime) {
            log.warn("Signed URL expired for fileName: {}, userId: {}", fileName, userId);
            return false;
        }

        String expectedSignature = generateSignature(fileName, lectureId, userId, expiryTime);
        if (!expectedSignature.equals(signature)) {
            log.warn("Invalid signature for fileName: {}, userId: {}", fileName, userId);
            return false;
        }
        return hasAccessPermission(lectureId, userId);
    }

    @Override
    public boolean hasAccessPermission(UUID lectureId, UUID userId) {
        Lecture lecture =  lectureRepository.findById(lectureId).orElse(null);
        if (lecture == null) {
            throw new AppException(ErrorCode.LECTURE_NOT_FOUND);
        }
        return enrollmentRepository.existsById(EnrollmentId.builder()
                        .courseId(lecture.getSection().getCourse().getId())
                        .userId(userId)
                .build());
    }

    @Override
    public Resource loadProtectedFile(String fileName, String type) throws MalformedURLException {
        Path filePath;
        if("video".equals(type)) {
            filePath = Paths.get(videoDir, fileName);
        } else {
            filePath = Paths.get(documentDir, fileName);
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    @Override
    public Resource loadAvatarFile(String fileName) throws MalformedURLException {
        Path filePath = Paths.get(avatarDir).resolve(fileName);
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    @Override
    public void deleteFile(String fileName, String type) throws IOException {
        Path filePath = switch (type) {
            case "avatar" -> Paths.get(avatarDir).resolve(fileName);
            case "video" -> Paths.get(videoDir).resolve(fileName);
            case "document" -> Paths.get(documentDir).resolve(fileName);
            default -> throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        };

        Files.deleteIfExists(filePath);
    }
    @Override
    public int getVideoTokenExpiration() {
        return videoTokenExpiration;
    }

    private String saveFile(MultipartFile file, String directory, String prefix) throws IOException {
        Path uploadPath = Paths.get(directory);
        if(!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";

        String fileName = prefix + UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    private String generateSignature(String fileName, UUID lectureId, UUID userId, long expiryTime) {
        try{
            String data = fileName + "|" + lectureId + "|" + userId + "|" + expiryTime;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(urlSigningKey.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmac = mac.doFinal(data.getBytes());
            return Base64.getEncoder().withoutPadding().encodeToString(hmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }

    private void validateImageFile(MultipartFile file) throws IOException {
        if(file.isEmpty()){
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        if(file.getSize() > 5 * 1024 * 1024){
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }
    }

    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()){
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        if(file.getSize() > 500 * 1024 * 1024){
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }
    }

    private void validateDocumentFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        if (file.getSize() > 50 * 1024 * 1024) { // 50MB
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }
    }
}
