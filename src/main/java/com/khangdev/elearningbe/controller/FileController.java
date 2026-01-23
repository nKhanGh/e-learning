package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.response.common.SignedUrlResponse;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.service.FileService;
import com.khangdev.elearningbe.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
@Slf4j
public class FileController {
    private final FileService fileService;
    private final UserService userService;

    @GetMapping("/avatar/{fileName}")
    public ResponseEntity<Resource> downloadAvatar(@PathVariable String fileName) throws MalformedURLException {

        Resource resource = fileService.loadAvatarFile(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }

    @GetMapping("/protected/{fileName}")
    public ResponseEntity<Resource> downloadProtectedFile(
            @PathVariable String fileName,
            @RequestParam UUID lectureId,
            @RequestParam UUID userId,
            @RequestParam long expires,
            @RequestParam String signature) throws MalformedURLException {

        if (!fileService.verifySignedUrl(fileName, lectureId, userId, expires, signature)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String type = fileName.startsWith("video") ? "video" : "document";
        Resource resource = fileService.loadProtectedFile(fileName, type);

        MediaType mediaType = type.equals("video")
                ? MediaType.parseMediaType("video/mp4")
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }

    // Generate signed URL for accessing video/document
    @GetMapping("/signed-url")
    public ResponseEntity<SignedUrlResponse> generateSignedUrl(
            @RequestParam String fileName,
            @RequestParam UUID lectureId) {

        UUID userId = userService.getMyInfo().getId();

        // Check permission first
        if (!fileService.hasAccessPermission(lectureId, userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String signedUrl = fileService.generateSignedUrl(fileName, lectureId, userId);

        return ResponseEntity.ok(SignedUrlResponse.builder()
                .signedUrl(signedUrl)
                .expiresIn(fileService.getVideoTokenExpiration())
                .build());
    }

}
