package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.request.course.QuizSubmitRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptAnswerResponse;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptQuestionReviewResponse;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptReviewResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.QuizAnswer;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.enums.AttemptStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizAttemptMapper;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.QuizAnswerRepository;
import com.khangdev.elearningbe.repository.QuizAttemptRepository;
import com.khangdev.elearningbe.repository.QuizQuestionRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.course.QuizAnswerService;
import com.khangdev.elearningbe.service.course.QuizAttemptService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final QuizAnswerService quizAnswerService;
    private final QuizAttemptMapper quizAttemptMapper;

    @Override
    @Transactional
    public QuizAttemptResponse attemptQuiz(UUID quizId) {
        Quiz quiz = getQuiz(quizId);
        UUID userId = userService.getMyInfo().getId();
        ensureEnrollment(userId, quiz);

        List<QuizAttempt> attempts = quizAttemptRepository.findAllByUserIdAndQuizId(userId, quizId);
        QuizAttempt inProgressAttempt = attempts.stream()
                .filter(attempt -> attempt.getStatus() == AttemptStatus.IN_PROGRESS)
                .max(Comparator.comparing(attempt -> attempt.getId().getAttemptNumber()))
                .orElse(null);
        if (inProgressAttempt != null) {
            return toStudentAttemptResponse(inProgressAttempt);
        }

        long completedAttempts = attempts.stream()
                .filter(attempt -> attempt.getStatus() != AttemptStatus.IN_PROGRESS)
                .count();
        if (quiz.getMaxAttempts() != null
                && quiz.getMaxAttempts() > 0
                && completedAttempts >= quiz.getMaxAttempts()) {
            throw new AppException(ErrorCode.QUIZ_ATTEMPT_LIMIT_REACHED);
        }

        Integer maxAttemptNumber = quizAttemptRepository.findMaxAttemptNumber(quizId, userId);
        int nextAttemptNumber = maxAttemptNumber == null ? 1 : maxAttemptNumber + 1;

        QuizAttempt attempt = QuizAttempt.builder()
                .id(QuizAttemptId.builder()
                        .quizId(quizId)
                        .userId(userId)
                        .attemptNumber(nextAttemptNumber)
                        .build())
                .quiz(quiz)
                .user(userRepository.findById(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)))
                .build();

        return toStudentAttemptResponse(quizAttemptRepository.save(attempt));
    }

    @Override
    @Transactional
    public void saveQuizAnswers(UUID quizId, QuizSubmitRequest request) {
        QuizAttempt attempt = getMyInProgressAttempt(quizId);
        quizAnswerService.saveQuizAnswers(attempt, request == null ? null : request.getAnswers());
    }

    @Override
    @Transactional
    public QuizAttemptResponse submitQuiz(UUID quizId, QuizSubmitRequest request) {
        QuizAttempt attempt = getMyInProgressAttempt(quizId);
        quizAnswerService.saveQuizAnswers(attempt, request == null ? null : request.getAnswers());

        List<QuizAnswer> answers = quizAnswerRepository.findAllForAttempt(
                attempt.getUser().getId(),
                quizId,
                attempt.getId().getAttemptNumber()
        );
        BigDecimal score = answers.stream()
                .map(QuizAnswer::getScore)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        attempt.setSubmittedAt(Instant.now());
        attempt.setTimeTakenSeconds(Math.toIntExact(Duration.between(
                attempt.getCreatedAt(),
                attempt.getSubmittedAt()
        ).getSeconds()));
        attempt.setScore(score);

        BigDecimal totalPoints = attempt.getQuiz().getTotalPoints();
        BigDecimal percentage = totalPoints == null || totalPoints.compareTo(BigDecimal.ZERO) <= 0
                ? BigDecimal.ZERO
                : score.divide(totalPoints, 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
        attempt.setPercentage(percentage);
        attempt.setPassed(percentage.compareTo(attempt.getQuiz().getPassingScore()) >= 0);
        attempt.setStatus(AttemptStatus.GRADED);

        return toStudentAttemptResponse(quizAttemptRepository.save(attempt));
    }

    @Override
    @Transactional(readOnly = true)
    public QuizAttemptResponse getAttempt(UUID userId, UUID quizId, Integer attemptNumber) {
        QuizAttempt attempt = findAttempt(userId, quizId, attemptNumber);
        UUID actorId = userService.getMyInfo().getId();
        if (!userId.equals(actorId)
                && !attempt.getQuiz().getLecture().getSection().getCourse().getInstructor().getId().equals(actorId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return toStudentAttemptResponse(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getAllAttempts(UUID userId, UUID quizId) {
        return quizAttemptRepository.findAllByUserIdAndQuizId(userId, quizId).stream()
                .sorted(Comparator.comparing(attempt -> attempt.getId().getAttemptNumber()))
                .map(this::toStudentAttemptResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAttemptAnswerResponse> getMyAttemptAnswers(UUID quizId, Integer attemptNumber) {
        UUID userId = userService.getMyInfo().getId();
        findAttempt(userId, quizId, attemptNumber);

        return quizAnswerRepository.findAllForAttempt(userId, quizId, attemptNumber).stream()
                .map(answer -> QuizAttemptAnswerResponse.builder()
                        .questionId(answer.getQuestion().getId())
                        .answers(answer.getAnswers())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizAttemptReviewResponse getMyAttemptReview(UUID quizId, Integer attemptNumber) {
        UUID userId = userService.getMyInfo().getId();
        QuizAttempt attempt = findAttempt(userId, quizId, attemptNumber);
        Quiz quiz = attempt.getQuiz();

        if (attempt.getStatus() != AttemptStatus.GRADED
                || !Boolean.TRUE.equals(quiz.getShowAnswersAfterSubmission())) {
            throw new AppException(ErrorCode.QUIZ_REVIEW_UNAVAILABLE);
        }

        Map<UUID, QuizAnswer> answersByQuestionId = new HashMap<>();
        for (QuizAnswer answer : quizAnswerRepository.findAllForAttempt(userId, quizId, attemptNumber)) {
            answersByQuestionId.put(answer.getQuestion().getId(), answer);
        }

        boolean showCorrectAnswers = Boolean.TRUE.equals(quiz.getShowCorrectAnswers());
        List<QuizAttemptQuestionReviewResponse> questions = quizQuestionRepository
                .findByQuizIdOrderByDisplayOrderAsc(quizId)
                .stream()
                .map(question -> toReviewQuestion(question, answersByQuestionId.get(question.getId()), showCorrectAnswers))
                .toList();

        return QuizAttemptReviewResponse.builder()
                .attempt(toStudentAttemptResponse(attempt))
                .showCorrectAnswers(showCorrectAnswers)
                .questions(questions)
                .build();
    }

    private QuizAttemptQuestionReviewResponse toReviewQuestion(
            QuizQuestion question,
            QuizAnswer answer,
            boolean showCorrectAnswers
    ) {
        BigDecimal score = answer == null || answer.getScore() == null ? BigDecimal.ZERO : answer.getScore();
        BigDecimal points = question.getPoints() == null ? BigDecimal.ZERO : question.getPoints();

        return QuizAttemptQuestionReviewResponse.builder()
                .questionId(question.getId())
                .questionText(question.getQuestionText())
                .points(points)
                .displayOrder(question.getDisplayOrder())
                .options(question.getOptions() == null ? List.of() : question.getOptions())
                .selectedAnswers(answer == null || answer.getAnswers() == null ? List.of() : answer.getAnswers())
                .score(score)
                .correct(showCorrectAnswers ? score.compareTo(points) >= 0 : null)
                .correctAnswers(showCorrectAnswers
                        ? (question.getCorrectAnswers() == null ? List.of() : question.getCorrectAnswers())
                        : List.of())
                .explanation(showCorrectAnswers ? question.getExplanation() : null)
                .build();
    }

    private QuizAttempt getMyInProgressAttempt(UUID quizId) {
        UUID userId = userService.getMyInfo().getId();
        Quiz quiz = getQuiz(quizId);
        ensureEnrollment(userId, quiz);

        return quizAttemptRepository.findAllByUserIdAndQuizId(userId, quizId).stream()
                .filter(attempt -> attempt.getStatus() == AttemptStatus.IN_PROGRESS)
                .max(Comparator.comparing(attempt -> attempt.getId().getAttemptNumber()))
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND));
    }

    private QuizAttempt findAttempt(UUID userId, UUID quizId, Integer attemptNumber) {
        return quizAttemptRepository.findById(QuizAttemptId.builder()
                        .userId(userId)
                        .quizId(quizId)
                        .attemptNumber(attemptNumber)
                        .build())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_ATTEMPT_NOT_FOUND));
    }

    private Quiz getQuiz(UUID quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
    }

    private void ensureEnrollment(UUID userId, Quiz quiz) {
        UUID courseId = quiz.getLecture().getSection().getCourse().getId();
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new AppException(ErrorCode.ENROLLMENT_NOT_FOUND);
        }
    }

    private QuizAttemptResponse toStudentAttemptResponse(QuizAttempt attempt) {
        QuizAttemptResponse response = quizAttemptMapper.toResponse(attempt);
        if (response.getQuiz() != null && response.getQuiz().getQuestions() != null) {
            response.getQuiz().getQuestions().forEach(question -> {
                question.setCorrectAnswers(List.of());
                question.setExplanation(null);
            });
        }
        return response;
    }
}
