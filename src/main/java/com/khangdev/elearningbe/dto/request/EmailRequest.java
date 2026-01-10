package com.khangdev.elearningbe.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailRequest {
    MailSender sender;
    List<MailRecipient> to;
    String subject;
    String htmlContent;
}
