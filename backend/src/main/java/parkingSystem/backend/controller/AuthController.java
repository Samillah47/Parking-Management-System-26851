package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import parkingSystem.backend.dto.LoginRequest;
import parkingSystem.backend.dto.AuthResponse;
import parkingSystem.backend.dto.TwoFARequest;
import parkingSystem.backend.dto.SignupRequest;
import parkingSystem.backend.model.User;
import parkingSystem.backend.model.enums.Role;
import parkingSystem.backend.repository.UserRepository;
import parkingSystem.backend.security.JwtUtils;
import parkingSystem.backend.service.EmailService;
import parkingSystem.backend.service.UserService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    /**
     * Step 1: Initial login - sends 2FA code
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Authenticate username and password
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            // Get user
            User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // If 2FA is disabled, return token directly
            if (user.getTwoFAEnabled() == null || !user.getTwoFAEnabled()) {
                String token = jwtUtils.generateToken(user);
                return ResponseEntity.ok(new AuthResponse(token, user));
            }

            // Generate 6-digit code
            String twoFACode = String.format("%06d", new Random().nextInt(999999));
            
            // Save code with 5-minute expiry
            user.setTwoFACode(twoFACode);
            user.setTwoFAExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);

            // Send email
            emailService.send2FACode(user.getEmail(), twoFACode);

            // Return response indicating 2FA is required
            Map<String, Object> response = new HashMap<>();
            response.put("require2FA", true);
            response.put("userId", user.getUserId());
            response.put("message", "Verification code sent to " + maskEmail(user.getEmail()));
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username or password");
            return ResponseEntity.status(401).body(error);
        }
    }

    /**
     * Step 2: Verify 2FA code and return JWT token
     */
    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestBody TwoFARequest request) {
        try {
            // Find user
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if code exists
            if (user.getTwoFACode() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No verification code found. Please login again.");
                return ResponseEntity.status(400).body(error);
            }

            // Check if code expired
            if (user.getTwoFAExpiry().isBefore(LocalDateTime.now())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Verification code expired. Please login again.");
                return ResponseEntity.status(400).body(error);
            }

            // Verify code
            if (!request.getCode().equals(user.getTwoFACode())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid verification code");
                return ResponseEntity.status(401).body(error);
            }

            // Clear 2FA code
            user.setTwoFACode(null);
            user.setTwoFAExpiry(null);
            userRepository.save(user);

            // Generate JWT token
            String token = jwtUtils.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(token, user));

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Resend 2FA code
     */
    @PostMapping("/resend-2fa")
    public ResponseEntity<?> resend2FA(@RequestParam Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate new code
            String twoFACode = String.format("%06d", new Random().nextInt(999999));
            user.setTwoFACode(twoFACode);
            user.setTwoFAExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);

            // Send email
            emailService.send2FACode(user.getEmail(), twoFACode);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification code resent");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Register new user
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            // Check if username exists
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username already exists");
                return ResponseEntity.status(400).body(error);
            }

            // Check if email exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already exists");
                return ResponseEntity.status(400).body(error);
            }

            // Create new user
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setRole(Role.USER); // Default role
            user.setTwoFAEnabled(true); // Enable 2FA by default

            user = userRepository.save(user);

            // Generate token
            String token = jwtUtils.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(token, user));

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Forgot Password - Send OTP
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            userService.sendOTP(email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent to your email");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    /**
     * Reset Password with OTP
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");
            
            userService.resetPassword(email, otp, newPassword);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    /**
     * Helper: Mask email for privacy
     */
    private String maskEmail(String email) {
        int atIndex = email.indexOf("@");
        if (atIndex <= 2) return email;
        return email.substring(0, 2) + "***" + email.substring(atIndex);
    }
}