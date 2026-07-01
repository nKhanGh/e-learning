package com.khangdev.elearningbe.service.common;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.UUID;

public interface FileService {
     String uploadAvatar(MultipartFile file) throws IOException;
     String uploadVideo(MultipartFile file) throws IOException;
     String uploadDocument(MultipartFile file) throws IOException;
     String uploadChatFile(MultipartFile file) throws IOException;
     String generateSignedUrl(String fileId, UUID lectureId, UUID userId);
     boolean verifySignedUrl(String fileId, UUID lectureId, UUID userId,
                                   long expiryTime, String signature);
     boolean hasAccessPermission(UUID lectureId, UUID userId);
     Resource loadProtectedFile(String fileId, String type) throws MalformedURLException;
     Resource loadAvatarFile(String fileId) throws MalformedURLException;
     void deleteFile(String fileId, String type) throws IOException;

     public int getVideoTokenExpiration();
}
