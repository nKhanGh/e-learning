package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.course.QuizRequest;
import com.khangdev.elearningbe.dto.request.course.QuizSubmitRequest;
import com.khangdev.elearningbe.dto.request.course.QuizUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.dto.response.course.QuizResponse;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizAttemptMapper;
import com.khangdev.elearningbe.mapper.QuizMapper;
import com.khangdev.elearningbe.repository.*;
import com.khangdev.elearningbe.service.QuizService;
import com.khangdev.elearningbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    private final QuizRepository quizRepository;
    private final QuizMapper quizMapper;
    private final UserService userService;
    private final LectureRepository lectureRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final QuizAttemptMapper quizAttemptMapper;

    private void authorize(UUID courseUserId) {
        UUID userId = userService.getMyInfo().getId();
        if(!courseUserId.equals(userId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }


    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Transactional
    public QuizResponse createQuiz(QuizRequest quizRequest) {
        Lecture lecture = lectureRepository.findById(quizRequest.getLectureId())
                .orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));

        authorize(lecture.getSection().getCourse().getInstructor().getId());
        if(lecture.getQuiz() != null) {
            throw new AppException(ErrorCode.QUIZ_EXISTED);
        }
        Quiz quiz = quizMapper.toQuiz(quizRequest);
        quiz.setLecture(lecture);
        lecture.setQuiz(quiz);
        quizRepository.save(quiz);

        return quizMapper.toQuizResponse(quiz);
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Transactional
    public QuizResponse updateQuiz(UUID quizId, QuizUpdateRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));

        authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());

        quizMapper.updateQuiz(quiz, request);
//        quizRepository.save(quiz);
        return quizMapper.toQuizResponse(quiz);
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public QuizResponse getByLectureId(UUID lectureId) {
        Quiz quiz = quizRepository.findByLectureId(lectureId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());
        return quizMapper.toQuizResponse(quiz);
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public QuizResponse getByQuizId(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());
        return quizMapper.toQuizResponse(quiz);
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Transactional
    public void deleteById(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());
        quizRepository.delete(quiz);
    }

    @Override
    public QuizResponse getPublicQuizByLectureId(UUID lectureId) {
        Quiz quiz = quizRepository.findByLectureId(lectureId).orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        if(!quiz.getIsPublished()){
            authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());
        }
        return quizMapper.toQuizResponse(quiz);
    }

    @Override
    public QuizResponse getPublicQuizByQuizId(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        if(!quiz.getIsPublished()){
            authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());
        }
        return quizMapper.toQuizResponse(quiz);
    }
}
