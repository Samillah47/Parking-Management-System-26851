package parkingSystem.backend.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import parkingSystem.backend.config.UserDetailsImpl;
import parkingSystem.backend.dto.JwtResponse;
import parkingSystem.backend.dto.LoginRequest;
import parkingSystem.backend.dto.SignupRequest;
import parkingSystem.backend.security.JwtUtils;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserService userService;

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken((UserDetails) authentication.getPrincipal());

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String authority = userDetails.getAuthorities().iterator().next().getAuthority();
        String role = authority.startsWith("ROLE_") ? authority.substring(5) : authority;

        return new JwtResponse(
                jwt,
                "Bearer",
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role
        );
    }

    public void signup(SignupRequest signUpRequest) {
        userService.createUserFromSignup(signUpRequest);
    }

    public void forgotPassword(String email) {
        userService.sendOTP(email);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        userService.resetPassword(email, otp, newPassword);
    }
}
