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
- `POST /api/quiz-questions/import`
- `DELETE /api/quiz-questions/{quizQuestionId}`
- `PUT /api/quiz-questions/{quizQuestionId}`

## Luong chinh

1. Instructor tao lecture co `contentType = QUIZ`.
2. Instructor mo lecture preview/detail de tao hoac sua quiz config.
3. Instructor tao/sua/xoa questions hoac import JSON.
4. Student lay public quiz/quiz detail tuy quyen truy cap.
5. Student submit attempt/submission.
6. Backend tinh score, luu attempt va answers.

## Import JSON

`POST /api/quiz-questions/import` nhan request:

- `quizId`
- `mode`: `APPEND` hoac `REPLACE`
- `questions`: danh sach cau hoi

Moi question chi nen gom:

- `questionText`
- `explanation`
- `points`
- `options`
- `correctAnswers`

Image/video khong nam trong JSON import hien tai; media upload se lam rieng sau.

Append mode ho tro ca quiz chua co question.

## Test lien quan

- `controller/QuizControllerTest.java`
- `controller/QuizQuestionControllerTest.java`
- `service/QuizServiceTest.java`
- `service/QuizQuestionServiceTest.java`
- `service/QuizAttemptServiceTest.java`
- `service/QuizAnswerServiceTest.java`
