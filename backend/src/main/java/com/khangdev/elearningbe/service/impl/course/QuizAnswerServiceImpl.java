package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;
import com.khangdev.elearningbe.entity.course.QuizAnswer;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.entity.id.QuizAnswerId;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.enums.AttemptStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizAnswerMapper;
import com.khangdev.elearningbe.repository.QuizAnswerRepository;
import com.khangdev.elearningbe.repository.QuizAttemptRepository;
import com.khangdev.elearningbe.repository.QuizQuestionRepository;
import com.khangdev.elearningbe.service.course.QuizAnswerService;
import com.khangdev.elearningbe.service.course.QuizQuestionService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizAnswerServiceImpl implements QuizAnswerService {
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizQuestionService quizQuestionService;
    private final UserService userService;
    private final QuizAnswerMapper quizAnswerMapper;

    @Override
    @Transactional
    public QuizAnswerResponse createQuizAnswer(QuizAnswerRequest request) {
        QuizQuestion question = quizQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        UUID quizId = question.getQuiz().getId();
        Integer attemptNumber = quizAttemptRepository.findMaxAttemptNumber(quizId, userId);
        if (attemptNumber == null) {
            throw new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND);
        }

        QuizAttempt attempt = quizAttemptRepository.findById(QuizAttemptId.builder()
                        .userId(userId)
                        .quizId(quizId)
                        .attemptNumber(attemptNumber)
                        .build())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND));
        saveQuizAnswers(attempt, List.of(request));

        QuizAnswerId answerId = QuizAnswerId.builder()
                .userId(userId)
                .attemptNumber(attemptNumber)
                .quizQuestionId(question.getId())
                .build();
        QuizAnswer answer = quizAnswerRepository.findById(answerId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));
        return quizAnswerMapper.toResponse(answer);
    }

    @Override
    @Transactional
    public void saveQuizAnswers(QuizAttempt attempt, List<QuizAnswerRequest> requests) {
        if (!attempt.getStatus().equals(AttemptStatus.IN_PROGRESS)) {
            throw new AppException(ErrorCode.QUIZ_ATTEMPT_INVALID);
        }

        if (requests == null) {
            return;
        }

        UUID quizId = attempt.getQuiz().getId();
        for (QuizAnswerRequest request : requests) {
            if (request == null || request.getQuestionId() == null) {
                throw new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND);
            }

            QuizQuestion question = quizQuestionRepository.findById(request.getQuestionId())
                    .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));
            if (!question.getQuiz().getId().equals(quizId)) {
                throw new AppException(ErrorCode.QUIZ_ATTEMPT_INVALID);
            }

            List<String> selectedAnswers = normalizeAnswers(question, request.getAnswers());
            QuizAnswerId answerId = QuizAnswerId.builder()
                    .userId(attempt.getUser().getId())
                    .attemptNumber(attempt.getId().getAttemptNumber())
                    .quizQuestionId(question.getId())
                    .build();

            QuizAnswer answer = quizAnswerRepository.findById(answerId)
                    .orElseGet(() -> QuizAnswer.builder()
                            .id(answerId)
                            .user(attempt.getUser())
                            .question(question)
                            .build());

            answer.setAnswers(selectedAnswers);
            answer.setScore(quizQuestionService.calculateScore(
                    QuizAnswerRequest.builder()
                            .questionId(question.getId())
                            .answers(selectedAnswers)
                            .build()
            ));
            quizAnswerRepository.save(answer);
        }
    }

    private List<String> normalizeAnswers(QuizQuestion question, List<String> answers) {
        if (answers == null || question.getOptions() == null) {
            return List.of();
        }

        return answers.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(answer -> !answer.isBlank())
                .filter(question.getOptions()::contains)
                .distinct()
                .toList();
    }
}
