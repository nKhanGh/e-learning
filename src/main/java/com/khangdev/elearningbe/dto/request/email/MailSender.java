package com.khangdev.elearningbe.dto.request.email;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MailSender {
    String name;
    String email;
}
