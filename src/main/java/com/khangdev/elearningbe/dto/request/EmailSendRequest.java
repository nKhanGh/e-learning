package com.khangdev.elearningbe.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailSendRequest {
    MailRecipient recipient;
    String subject;
    String htmlContent;
}
