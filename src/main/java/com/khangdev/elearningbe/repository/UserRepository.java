package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    List<User> findAllByEmailContainingIgnoreCase(String emailPart);

    @Query("""

            select u from User u
where (
    lower(concat(u.firstName, ' ', u.lastName)) like lower(concat('%', :keyword, '%'))
    or lower(concat(u.lastName, ' ', u.firstName)) like lower(concat('%', :keyword, '%'))
)
and u.email <> :currentEmail
""")
    List<User> searchUser(@Param("keyword") String keyword, @Param("currentEmail") String currentEmail);
}
