package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.interaction.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
}
