package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Password Reset OTP - Parking System");
            message.setText("Your OTP for password reset is: " + otp + "\n\nThis OTP is valid for 10 minutes only.");
            mailSender.send(message);
            System.out.println("✓ OTP email sent to: " + to);
        } catch (Exception e) {
            System.err.println("⚠ Email not configured. OTP: " + otp + " for " + to);
        }
    }

    public void sendWelcomeEmail(String to, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Welcome to Parking System");
            message.setText("Hello " + username + ",\n\nWelcome to our Parking Management System. Your account has been successfully created.");
            mailSender.send(message);
            System.out.println("✓ Welcome email sent to: " + to);
        } catch (Exception e) {
            System.err.println("⚠ Email not configured. Welcome message for: " + username);
        }
    }

    public void send2FACode(String email, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your Login Verification Code");
            message.setText(
                "Your verification code is: " + code + "\n\n" +
                "This code will expire in 5 minutes.\n\n" +
                "If you didn't request this code, please ignore this email."
            );
            mailSender.send(message);
            System.out.println("✓ 2FA code sent to: " + email);
        } catch (Exception e) {
            System.err.println("⚠ Email not configured. 2FA Code: " + code + " for " + email);
        }
    }
}
