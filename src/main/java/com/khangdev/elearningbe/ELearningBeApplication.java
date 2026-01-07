package com.khangdev.elearningbe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableFeignClients
@EnableKafka
@EnableScheduling
@EnableMethodSecurity
@EnableJpaAuditing
public class ELearningBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(ELearningBeApplication.class, args);
	}

}
