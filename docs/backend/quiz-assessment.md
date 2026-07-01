# Backend Module: Quiz va Assessment

## Muc dich

Quan ly quiz, question, answer, attempt va submission cua nguoi hoc.

## File chinh

- `controller/QuizController.java`
- `controller/QuizQuestionController.java`
- `service/course/QuizService.java`
- `service/course/QuizQuestionService.java`
- `service/course/QuizAttemptService.java`
- `service/course/QuizAnswerService.java`
- `service/impl/course/QuizServiceImpl.java`
- `service/impl/course/QuizQuestionServiceImpl.java`
- `service/impl/course/QuizAttemptServiceImpl.java`
- `service/impl/course/QuizAnswerServiceImpl.java`
- `entity/course/Quiz.java`, `QuizQuestion.java`, `QuizAttempt.java`, `QuizAnswer.java`
- `entity/id/QuizAttemptId.java`, `QuizAnswerId.java`
- `repository/QuizRepository.java`, `QuizQuestionRepository.java`, `QuizAttemptRepository.java`, `QuizAnswerRepository.java`
- `mapper/QuizMapper.java`, `QuizQuestionMapper.java`, `QuizAttemptMapper.java`, `QuizAnswerMapper.java`
- `dto/request/course/Quiz*`
- `dto/response/course/Quiz*`

## API

- `POST /api/quizzes`
- `PUT /api/quizzes/{quizId}`
- `GET /api/quizzes/lecture/{lectureId}`
- `GET /api/quizzes/public/lecture/{lectureId}`
- `GET /api/quizzes/{quizId}`
- `GET /api/quizzes/public/{quizId}`
- `DELETE /api/quizzes/{quizId}`
- `POST /api/quizzes/{quizId}/attempts`
- `PUT /api/quizzes/{quizId}/submission`
- `GET /api/quizzes/{quizId}/users/{userId}/attempts/{attemptNumber}`
- `GET /api/quizzes/quizzes/{quizId}/attempts/{attemptNumber}`
- `GET /api/quizzes/{quizId}/attempts`
- `GET /api/quiz-questions/{quizId}`
- `POST /api/quiz-questions`
- `DELETE /api/quiz-questions/{quizQuestionId}`
- `PUT /api/quiz-questions/{quizQuestionId}`

## Luong chinh

1. Instructor tao quiz va questions cho lecture.
2. Student lay public quiz/quiz detail tuy quyen truy cap.
3. Student submit attempt/submission.
4. Backend tinh score, luu attempt va answers.

## Test lien quan

- `controller/QuizControllerTest.java`
- `controller/QuizQuestionControllerTest.java`
- `service/QuizServiceTest.java`
- `service/QuizQuestionServiceTest.java`
- `service/QuizAttemptServiceTest.java`
- `service/QuizAnswerServiceTest.java`
