package com.passwordlessauth.config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Mail sender configuration, driven entirely by {@code spring.mail.*} properties
 * so it honours the active profile: local dev and docker point at MailHog
 * (no auth/TLS), while a real deployment can point at an authenticated SMTP
 * relay simply by setting MAIL_HOST/MAIL_USERNAME/MAIL_PASSWORD.
 */
@Configuration
public class MailConfig {

    @Value("${spring.mail.host:localhost}")
    private String host;

    @Value("${spring.mail.port:1025}")
    private int port;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);

        boolean authenticated = username != null && !username.isBlank();
        if (authenticated) {
            mailSender.setUsername(username);
            mailSender.setPassword(password);
        }

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(authenticated));
        props.put("mail.smtp.starttls.enable", String.valueOf(authenticated));
        if (authenticated) {
            props.put("mail.smtp.ssl.trust", host);
        }

        return mailSender;
    }
}
