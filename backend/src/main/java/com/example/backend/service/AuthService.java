package com.example.backend.service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.VerifyEmailRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String verifyEmailAndCreateAccount(
            VerifyEmailRequest request
    ) {

        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new RuntimeException(
                    "Passwords do not match"
            );
        }

        FirebaseToken decodedToken;

        try {

            decodedToken =
                    FirebaseAuth.getInstance()
                            .verifyIdToken(
                                    request.getFirebaseIdToken()
                            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid Firebase verification token"
            );
        }

        String firebaseEmail =
                decodedToken.getEmail();

        Object emailVerified =
                decodedToken.getClaims().get("email_verified");

        if (firebaseEmail == null) {

            throw new RuntimeException(
                    "Firebase email was not found"
            );
        }

        if (!Boolean.TRUE.equals(emailVerified)) {

            throw new RuntimeException(
                    "Email has not been verified"
            );
        }

        if (!firebaseEmail.equalsIgnoreCase(
                request.getEmailaddress()
        )) {

            throw new RuntimeException(
                    "Email does not match the verified Firebase account"
            );
        }

        if (userRepository.existsByEmailaddress(
                request.getEmailaddress()
        )) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setFirstname(
                request.getFirstname()
        );

        user.setLastname(
                request.getLastname()
        );

        user.setEmailaddress(
                request.getEmailaddress()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        userRepository.save(user);

        return "Email verified and account created successfully";
    }

    public LoginResponse login(
            LoginRequest request
    ) {

        User user =
                userRepository
                        .findByEmailaddress(
                                request.getEmailaddress()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password"
                                )
                        );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String token =
                jwtService.generateToken(
                        user.getEmailaddress()
                );

        return new LoginResponse(
                "Login successful",
                token,
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmailaddress()
        );
    }
}