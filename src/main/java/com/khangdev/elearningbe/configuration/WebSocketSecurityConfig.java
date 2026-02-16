package com.khangdev.elearningbe.configuration;

import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.common.JwtService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.text.ParseException;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = accessor.getFirstNativeHeader("Authorization");

                    if(token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                        try{
                            SignedJWT signedJWT = jwtService.verifyToken(token, true);
                            String email = signedJWT.getJWTClaimsSet().getSubject();

                            userRepository.findByEmail(email)
                                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

                            UsernamePasswordAuthenticationToken auth =
                                    new  UsernamePasswordAuthenticationToken(email, null, null);

                            accessor.setUser(auth);
                        } catch (ParseException | JOSEException e) {
                            throw new RuntimeException(e);
                        }
                    } else {
                        throw new AppException(ErrorCode.UNAUTHENTICATED);
                    }
                }
                return message;
            }
        });
    }
}
