# Backend Module: User va Instructor

## Muc dich

Quan ly thong tin user, profile, avatar, status, reset password, tim kiem user va tao instructor profile.

## File chinh

- `controller/UserController.java`
- `service/user/UserService.java`
- `service/impl/user/UserServiceImpl.java`
- `entity/user/User.java`
- `entity/user/UserProfile.java`
- `entity/user/Instructor.java`
- `repository/UserRepository.java`
- `repository/UserProfileRepository.java`
- `repository/InstructorRepository.java`
- `mapper/UserMapper.java`, `UserProfileMapper.java`, `InstructorMapper.java`
- `dto/request/user/*`
- `dto/response/user/*`

## API

- `GET /api/users/my-info`
- `PUT /api/users/{userId}`
- `PUT /api/users/my-profile`
- `DELETE /api/users/{userId}`
- `GET /api/users/{userId}`
- `GET /api/users/course/{courseId}`
- `POST /api/users/instructor`
- `GET /api/users/search`

## Trach nhiem service

`UserService` cung cap:

- `register`
- `setStatus`
- `resetPassword`
- `getMyInfo`
- `deleteUser`
- `update`
- `getUserById`
- `getUserInCourse`
- `createInstructor`
- `searchUsers`

## Phu thuoc

- Authentication module de biet user hien tai.
- File service de upload avatar.
- Enrollment/course module khi lay danh sach user trong course.

## Test lien quan

- `controller/UserControllerTest.java`
- `service/UserServiceTest.java`
