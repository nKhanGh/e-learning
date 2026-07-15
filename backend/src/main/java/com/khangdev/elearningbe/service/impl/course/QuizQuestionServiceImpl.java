package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionImportRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionImportResponse;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizQuestionMapper;
import com.khangdev.elearningbe.repository.QuizQuestionRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import com.khangdev.elearningbe.service.course.QuizQuestionService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizQuestionServiceImpl implements QuizQuestionService {
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizRepository quizRepository;

    private final QuizQuestionMapper quizQuestionMapper;
    private final UserService userService;

    private void authorize(UUID courseUserId){
        UUID userId = userService.getMyInfo().getId();
        if(!courseUserId.equals(userId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void authorizeRead(UUID courseUserId) {
        var user = userService.getMyInfo();
        if (user.getRole() != UserRole.ADMIN && !courseUserId.equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private BigDecimal normalizePoints(BigDecimal points) {
        return points == null ? BigDecimal.ONE : points;
    }

    private List<String> normalizeList(List<String> values) {
        if (values == null) return List.of();

        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private void recalculateQuizSummary(Quiz quiz) {
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        BigDecimal totalPoints = questions.stream()
                .map(QuizQuestion::getPoints)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        quiz.setTotalQuestions(questions.size());
        quiz.setTotalPoints(totalPoints);
    }

    private void addImportError(
            List<QuizQuestionImportResponse.ImportError> errors,
            Integer index,
            String message
    ) {
        errors.add(QuizQuestionImportResponse.ImportError.builder()
                .index(index)
                .message(message)
                .build());
    }

    private List<QuizQuestionImportResponse.ImportError> validateImportQuestions(
            QuizQuestionImportRequest request
    ) {
        List<QuizQuestionImportResponse.ImportError> errors = new ArrayList<>();

        if (request == null || request.getQuizId() == null) {
            addImportError(errors, null, "quizId is required");
            return errors;
        }

        if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
            addImportError(errors, null, "questions must not be empty");
            return errors;
        }

        for (int index = 0; index < request.getQuestions().size(); index++) {
            QuizQuestionImportRequest.QuestionItem item = request.getQuestions().get(index);

            if (item == null) {
                addImportError(errors, index, "question item is required");
                continue;
            }

            if (normalize(item.getQuestionText()).isBlank()) {
                addImportError(errors, index, "questionText is required");
            }

            BigDecimal points = normalizePoints(item.getPoints());
            if (points.compareTo(BigDecimal.ZERO) <= 0) {
                addImportError(errors, index, "points must be greater than 0");
            }

            List<String> options = normalizeList(item.getOptions());
            if (options.size() < 2) {
                addImportError(errors, index, "options must contain at least 2 values");
            }

            List<String> correctAnswers = normalizeList(item.getCorrectAnswers());
            if (correctAnswers.isEmpty()) {
                addImportError(errors, index, "correctAnswers must contain at least 1 value");
            }

            List<String> missingAnswers = correctAnswers.stream()
                    .filter(answer -> !options.contains(answer))
                    .toList();
            if (!missingAnswers.isEmpty()) {
                addImportError(errors, index, "correctAnswers must exist in options: " + missingAnswers);
            }
        }

        return errors;
    }

    @Override
    public List<QuizQuestionResponse> findByQuizId(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        if(!quiz.getIsPublished()){
            authorizeRead(quiz.getLecture().getSection().getCourse().getInstructor().getId());
        }
        return quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId)
                .stream().map(quizQuestionMapper::toQuizQuestionResponse).toList();
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Transactional
    public QuizQuestionResponse createQuizQuestion(QuizQuestionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());
        QuizQuestion quizQuestion = quizQuestionMapper.toQuizQuestion(request);
        Integer maxOrder = quizQuestionRepository
                .findMaxDisplayOrderByQuizId(request.getQuizId());

        quizQuestion.setDisplayOrder(
                maxOrder == null ? 1 : maxOrder + 1
        );


        quiz.addQuestion(quizQuestion);
        quizQuestionRepository.save(quizQuestion);
        recalculateQuizSummary(quiz);

        return quizQuestionMapper.toQuizQuestionResponse(quizQuestion);
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Transactional
    public QuizQuestionImportResponse importQuizQuestions(QuizQuestionImportRequest request) {
        List<QuizQuestionImportResponse.ImportError> errors = validateImportQuestions(request);

        if (request == null || request.getQuizId() == null) {
            return QuizQuestionImportResponse.builder()
                    .importedCount(0)
                    .skippedCount(0)
                    .errors(errors)
                    .questions(List.of())
                    .build();
        }

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());

        if (!errors.isEmpty()) {
            return QuizQuestionImportResponse.builder()
                    .importedCount(0)
                    .skippedCount(request.getQuestions() == null ? 0 : request.getQuestions().size())
                    .errors(errors)
                    .questions(List.of())
                    .build();
        }

        QuizQuestionImportRequest.ImportMode mode = request.getMode() == null
                ? QuizQuestionImportRequest.ImportMode.APPEND
                : request.getMode();

        if (mode == QuizQuestionImportRequest.ImportMode.REPLACE) {
            List<QuizQuestion> existingQuestions = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
            quizQuestionRepository.deleteAll(existingQuestions);
            quizQuestionRepository.flush();
            quiz.getQuestions().clear();
        }

        Integer maxOrder;
        if (mode == QuizQuestionImportRequest.ImportMode.REPLACE) {
            maxOrder = 0;
        } else {
            maxOrder = quizQuestionRepository.findMaxDisplayOrderByQuizId(quiz.getId());
        }
        int nextOrder = maxOrder == null ? 1 : maxOrder + 1;
        List<QuizQuestion> importedQuestions = new ArrayList<>();

        for (QuizQuestionImportRequest.QuestionItem item : request.getQuestions()) {
            QuizQuestion question = QuizQuestion.builder()
                    .quiz(quiz)
                    .questionText(normalize(item.getQuestionText()))
                    .explanation(normalize(item.getExplanation()))
                    .points(normalizePoints(item.getPoints()))
                    .displayOrder(nextOrder++)
                    .options(normalizeList(item.getOptions()))
                    .correctAnswers(normalizeList(item.getCorrectAnswers()))
                    .build();

            quiz.getQuestions().add(question);
            importedQuestions.add(quizQuestionRepository.save(question));
        }

        recalculateQuizSummary(quiz);

        return QuizQuestionImportResponse.builder()
                .importedCount(importedQuestions.size())
                .skippedCount(0)
                .errors(List.of())
                .questions(importedQuestions.stream()
                        .map(quizQuestionMapper::toQuizQuestionResponse)
                        .toList())
                .build();
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Transactional
    public void deleteQuizQuestion(UUID quizQuestionId) {
        QuizQuestion question = quizQuestionRepository.findById(quizQuestionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));
        authorize(question.getQuiz().getLecture().getSection().getCourse().getInstructor().getId());
        Quiz quiz = question.getQuiz();
        quiz.removeQuestion(question);
        quizQuestionRepository.delete(question);
        recalculateQuizSummary(quiz);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public QuizQuestionResponse updateQuizQuestion(UUID quizQuestionId, QuizQuestionUpdateRequest request) {
        QuizQuestion question = quizQuestionRepository.findById(quizQuestionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));
        authorize(question.getQuiz().getLecture().getSection().getCourse().getInstructor().getId());
        quizQuestionMapper.updateQuizQuestion(question, request);
        QuizQuestion savedQuestion = quizQuestionRepository.save(question);
        recalculateQuizSummary(savedQuestion.getQuiz());
        return quizQuestionMapper.toQuizQuestionResponse(savedQuestion);
    }

    @Override
    public BigDecimal calculateScore(QuizAnswerRequest request) {
        QuizQuestion quizQuestion = quizQuestionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));

        int correctCount = quizQuestion.getCorrectAnswers().size();

        BigDecimal scorePerAnswer = BigDecimal.ONE
                .divide(BigDecimal.valueOf(correctCount), 2, RoundingMode.HALF_UP);

        long correctSelected = request.getAnswers().stream()
                .filter(quizQuestion.getCorrectAnswers()::contains)
                .count();

        return scorePerAnswer.multiply(BigDecimal.valueOf(correctSelected));
    }

}
