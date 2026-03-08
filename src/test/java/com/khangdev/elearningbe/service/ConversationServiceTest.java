package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.interaction.ConversationResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.dto.request.interaction.ConversationCreationRequest;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.ConversationMapper;
import com.khangdev.elearningbe.repository.ConversationRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.common.FileService;
import com.khangdev.elearningbe.service.interaction.ConversationService;
import com.khangdev.elearningbe.service.user.UserService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.UUID;

@SpringBootTest
public class ConversationServiceTest {

    @Autowired
    private ConversationService conversationService;

    @MockBean
    private ConversationRepository conversationRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private FileService fileService;

    @MockBean
    private ConversationMapper conversationMapper;

    @Test
    void getMyConversations_success() {
        UUID userId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).email("user@example.com").build();
        Conversation conversation = Conversation.builder().id(UUID.randomUUID()).name("Chat").build();
        ConversationResponse response = ConversationResponse.builder().id(conversation.getId()).name("Chat").build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(conversationRepository.findByUserId(userId)).thenReturn(List.of(conversation));
        Mockito.when(conversationMapper.toResponse(conversation)).thenReturn(response);

        List<ConversationResponse> result = conversationService.getMyConversations();

        Assertions.assertThat(result).hasSize(1);
        Assertions.assertThat(result.get(0).getName()).isEqualTo("Chat");
    }

    @Test
    void searchConversations_direct_noUserFound_returnEmpty() {
        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.searchUser("nope", userResponse.getEmail()))
                .thenReturn(List.of());

        List<ConversationResponse> result = conversationService.searchConversations("nope", false);

        Assertions.assertThat(result).isEmpty();
    }

    @Test
    void searchConversations_group_success() {
        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .build();
        Conversation conversation = Conversation.builder().id(UUID.randomUUID()).name("Group").build();
        ConversationResponse response = ConversationResponse.builder().id(conversation.getId()).name("Group").build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(conversationRepository.searchByNameLike("group", userResponse.getEmail()))
                .thenReturn(List.of(conversation));
        Mockito.when(conversationMapper.toResponse(conversation)).thenReturn(response);

        List<ConversationResponse> result = conversationService.searchConversations("group", true);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void searchConversations_direct_success() {
        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .build();
        User other = User.builder().id(UUID.randomUUID()).email("other@example.com").build();
        Conversation conversation = Conversation.builder().id(UUID.randomUUID()).name("Direct").build();
        ConversationResponse response = ConversationResponse.builder().id(conversation.getId()).name("Direct").build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.searchUser("keyword", userResponse.getEmail()))
                .thenReturn(List.of(other));
        Mockito.when(
                conversationRepository.findDirectConversationsWithUsers(userResponse.getId(), List.of(other.getId())))
                .thenReturn(List.of(conversation));
        Mockito.when(conversationMapper.toResponse(conversation)).thenReturn(response);

        List<ConversationResponse> result = conversationService.searchConversations("keyword", false);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void createConversation_direct_invalidParticipants_throwException() {
        ConversationCreationRequest request = ConversationCreationRequest.builder()
                .participantIds(List.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID()))
                .name("Direct")
                .build();

        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(UUID.randomUUID()).build());

        Assertions.assertThatThrownBy(() -> conversationService.createConversation(request, null))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_DIRECT_CONVERSATION);
    }

    @Test
    void rename_success() {
        UUID conversationId = UUID.randomUUID();
        Conversation conversation = Conversation.builder().id(conversationId).name("Old").build();
        ConversationResponse response = ConversationResponse.builder().id(conversationId).name("New").build();

        Mockito.when(conversationRepository.findById(conversationId)).thenReturn(java.util.Optional.of(conversation));
        Mockito.when(conversationRepository.save(conversation)).thenReturn(conversation);
        Mockito.when(conversationMapper.toResponse(conversation)).thenReturn(response);

        ConversationResponse result = conversationService.rename(conversationId, "New");

        Assertions.assertThat(result.getName()).isEqualTo("New");
    }

    @Test
    void deleteConversation_success() {
        UUID conversationId = UUID.randomUUID();

        conversationService.deleteConversation(conversationId);

        Mockito.verify(conversationRepository).deleteById(conversationId);
    }
}
