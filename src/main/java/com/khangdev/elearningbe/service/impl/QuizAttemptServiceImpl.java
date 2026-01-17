package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.course.QuizSubmitRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.enums.AttemptStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizAttemptMapper;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.QuizAttemptRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.QuizAnswerService;
import com.khangdev.elearningbe.service.QuizAttemptService;
import com.khangdev.elearningbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    private final UserService userService;
    private final QuizAnswerService quizAnswerService;

    private final QuizAttemptMapper quizAttemptMapper;


    @Override
    @Transactional
    public QuizAttemptResponse attemptQuiz(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        if(enrollmentRepository.existsByUserIdAndCourseId(userId, quiz.getLecture().getSection().getCourse().getId())){
            throw new AppException(ErrorCode.ENROLLMENT_NOT_FOUND);
        }

        List<QuizAttempt> existedQuizzes = quizAttemptRepository.findAllByUserIdAndQuizId(userId, quizId);
        if(!existedQuizzes.isEmpty()){
            existedQuizzes = existedQuizzes.stream().
                    filter(q -> q.getStatus().equals(AttemptStatus.IN_PROGRESS)).toList();
            if(!existedQuizzes.isEmpty()){
                throw new AppException(ErrorCode.QUIZ_ATTEMPT_INVALID);
            }
        }


        Integer attemptNumber = quizAttemptRepository.findMaxAttemptNumber(quizId, userId);
        attemptNumber = attemptNumber != null ? attemptNumber + 1 : 1;

        QuizAttempt quizAttempt = QuizAttempt.builder()
                .id(QuizAttemptId
                        .builder()
                        .quizId(quizId)
                        .userId(userId)
                        .attemptNumber(attemptNumber)
                        .build()
                )
                .quiz(quiz)
                .user(userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)))
                .build();
        quizAttemptRepository.save(quizAttempt);
        return quizAttemptMapper.toResponse(quizAttempt);
    }

    @Override
    @Transactional
    public QuizAttemptResponse submitQuiz(UUID quizId, QuizSubmitRequest request) {
        Quiz quiz;
        quiz = quizRepository.findById(quizId).orElseThrow(()-> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        if(enrollmentRepository.existsByUserIdAndCourseId(userId, quiz.getLecture().getSection().getCourse().getId())){
            throw new AppException(ErrorCode.ENROLLMENT_NOT_FOUND);
        }
        Integer attemptNumber = quizAttemptRepository.findMaxAttemptNumber(quizId, userId);

        if (attemptNumber == null) {
            throw new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND);
        }
        QuizAttempt quizAttempt = quizAttemptRepository.findById(
                QuizAttemptId.builder()
                        .userId(userId)
                        .quizId(quizId)
                        .attemptNumber(attemptNumber)
                        .build()
        ).orElseThrow(() -> new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND));

        if (!quizAttempt.getStatus().equals(AttemptStatus.IN_PROGRESS)) {
            throw new AppException(ErrorCode.QUIZ_ATTEMPT_INVALID);
        }

        quizAttempt.setSubmittedAt(Instant.now());
        quizAttempt.setTimeTakenSeconds(
                Math.toIntExact(
                        Duration.between(
                                quizAttempt.getCreatedAt(),
                                quizAttempt.getSubmittedAt()
                        ).getSeconds())
        );

        List<QuizAnswerResponse> quizAnswers = request.getAnswers()
                .stream()
                .map(quizAnswerService::createQuizAnswer)
                .toList();

        BigDecimal score = quizAnswers.stream()
                .map(QuizAnswerResponse::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        quizAttempt.setScore(score);

        BigDecimal percentage = score.divide(quiz.getTotalPoints(), 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
        quizAttempt.setPercentage(percentage);

        quizAttempt.setPassed(quizAttempt.getScore().compareTo(quiz.getPassingScore()) >= 0);
        quizAttempt.setStatus(AttemptStatus.GRADED);
        quizAttemptRepository.save(quizAttempt);

        return quizAttemptMapper.toResponse(quizAttempt);
    }

    @Override
    public QuizAttemptResponse getAttempt(UUID userId, UUID quizId, Integer attemptNumber) {
        QuizAttempt quizAttempt = quizAttemptRepository.findById(QuizAttemptId.builder()
                .attemptNumber(attemptNumber)
                .userId(userId)
                .quizId(quizId)
                .build()
        ).orElseThrow(() -> new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND));
        UUID actorId = userService.getMyInfo().getId();
        if (!userId.equals(actorId)){
            if (!quizAttempt.getQuiz().getLecture().getSection().getCourse().getInstructor().getId().equals(actorId)){
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        return quizAttemptMapper.toResponse(quizAttempt);
    }

    @Override
    public List<QuizAttemptResponse> getAllAttempts(UUID userId, UUID quizId) {
        return quizAttemptRepository.findAllByUserIdAndQuizId(userId, quizId)
                .stream().map(quizAttemptMapper::toResponse).toList();
    }
}
