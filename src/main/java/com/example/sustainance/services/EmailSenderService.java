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
            System.out.println("Email sent successfully.");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    public EmailSenderService(){
        this.my_email = "sustainancehelper@gmail.com";
        this.my_password = "oops";

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        this.properties = props;

    }
}
