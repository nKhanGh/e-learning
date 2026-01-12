package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.course.QuizQuestionRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizQuestionMapper;
import com.khangdev.elearningbe.repository.QuizQuestionRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import com.khangdev.elearningbe.service.QuizQuestionService;
import com.khangdev.elearningbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    @Override
    public List<QuizQuestionResponse> findByQuizId(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));
        if(!quiz.getIsPublished()){
            authorize(quiz.getLecture().getSection().getCourse().getInstructor().getId());
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
//        quizRepository.save(quiz);

        return quizQuestionMapper.toQuizQuestionResponse(quizQuestion);
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
//        quizRepository.save(quiz);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public QuizQuestionResponse updateQuizQuestion(UUID quizQuestionId, QuizQuestionUpdateRequest request) {
        QuizQuestion question = quizQuestionRepository.findById(quizQuestionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_QUESTION_NOT_FOUND));
        authorize(question.getQuiz().getLecture().getSection().getCourse().getInstructor().getId());
        quizQuestionMapper.updateQuizQuestion(question, request);
//        quizRepository.save(question.getQuiz());
        return quizQuestionMapper.toQuizQuestionResponse(question);
    }
}
