package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;
import com.khangdev.elearningbe.entity.course.QuizAnswer;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.entity.id.QuizAnswerId;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.AttemptStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizAnswerMapper;
import com.khangdev.elearningbe.repository.QuizAnswerRepository;
import com.khangdev.elearningbe.repository.QuizAttemptRepository;
import com.khangdev.elearningbe.repository.QuizQuestionRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.course.QuizAnswerService;
import com.khangdev.elearningbe.service.course.QuizQuestionService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizAnswerServiceImpl implements QuizAnswerService {
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserService userService;
    private final QuizQuestionService quizQuestionService;

    private final QuizAnswerMapper quizAnswerMapper;

    @Override
    @Transactional
    public QuizAnswerResponse createQuizAnswer(QuizAnswerRequest request) {
        QuizQuestion quizQuestion = quizQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        UUID quizId = quizQuestion.getQuiz().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Integer attemptNumber = quizAttemptRepository.findMaxAttemptNumber(quizId, userId);
        if (attemptNumber == null) {
            throw new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND);
        }

        QuizAttemptId attemptId = QuizAttemptId.builder()
                .userId(userId)
                .quizId(quizId)
                .attemptNumber(attemptNumber)
                .build();

        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND));

        if (!attempt.getStatus().equals(AttemptStatus.IN_PROGRESS)) {
            throw new AppException(ErrorCode.QUIZ_ATTEMPT_INVALID);
        }

        QuizAnswer quizAnswer = QuizAnswer.builder()
                .id(QuizAnswerId.builder()
                        .userId(userId)
                        .attemptNumber(quizAttemptRepository
                                .findMaxAttemptNumber(quizQuestion.getQuiz().getId(), userId))
                        .quizQuestionId(quizQuestion.getId())
                        .build()
                )
                .question(quizQuestion)
                .user(user)
                .answers(request.getAnswers())
                .score(quizQuestionService.calculateScore(request))
                .build();
        quizAnswerRepository.save(quizAnswer);
        return quizAnswerMapper.toResponse(quizAnswer);
    }
}
