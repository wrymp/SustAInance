package com.example.sustainance.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

@Service
@Slf4j
public class EmailSenderService {
    private final String my_email;
    private final String my_password;
    private final Properties properties;

    public void sendEmail(String recipients_email, String content){
        try {
            Session session = Session.getInstance(properties,
                    new Authenticator() {
                        protected PasswordAuthentication getPasswordAuthentication() {
                            return new PasswordAuthentication(my_email, my_password);
                        }
                    });
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("sustainancehelper@gmail.com"));
            message.setRecipients(
                    Message.RecipientType.TO,
                    InternetAddress.parse(recipients_email)
            );
            message.setSubject("Here's your meal plan shopping list.");
            message.setText(content);

            Transport.send(message);
            log.info("✅ Email sent successfully to: {}", recipients_email);

        } catch (MessagingException e) {
            log.error("❌ Failed to send email: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public EmailSenderService(){
        // Get from environment variables with fallback defaults
        this.my_email = System.getenv("SUSTAINANCE_HELPER_EMAIL");
        this.my_password = System.getenv("SUSTAINANCE_HELPER_PASSWORD");

        if (this.my_password == null || this.my_password.isEmpty()) {
            log.error("❌ GMAIL_APP_PASSWORD environment variable not set!");
            throw new RuntimeException("GMAIL_APP_PASSWORD environment variable is required");
        }

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        this.properties = props;
    }
}