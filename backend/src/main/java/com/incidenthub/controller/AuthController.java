package com.incidenthub.controller;

import com.incidenthub.dto.AuthResponseDTO;
import com.incidenthub.dto.LoginRequestDTO;
import com.incidenthub.dto.RegisterRequestDTO;
import com.incidenthub.dto.UserDTO;
import com.incidenthub.model.User;
import com.incidenthub.repository.UserRepository;
import com.incidenthub.service.UserService;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for User Authentication and Session Verification.
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, UserService userService,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        UserDTO created = userService.registerUser(request);
        String sessionToken = "session-" + created.getRole().toLowerCase() + "-"
                + UUID.randomUUID().toString().substring(0, 8);

        AuthResponseDTO response = new AuthResponseDTO(
                created.getId(),
                created.getUsername(),
                created.getFullName(),
                created.getEmail(),
                created.getRole(),
                sessionToken
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        String identifier = request.getUsernameOrEmail().trim();

        // Buscar usuario por username o email (case-insensitive)
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElse(null);

        if (user == null) {
            Map<String, String> error = Collections.singletonMap(
                    "message", "Usuario no encontrado en la base de datos.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Validación segura de contraseña con BCrypt y soporte de migración
        String rawPassword = request.getPassword().trim();
        String storedPassword = user.getPassword();
        boolean passwordMatches = false;

        if (storedPassword != null && !storedPassword.isEmpty()) {
            if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")
                    || storedPassword.startsWith("$2y$")) {
                passwordMatches = passwordEncoder.matches(rawPassword, storedPassword);
            } else if (storedPassword.equals(rawPassword)) {
                // Fallback para contraseñas heredadas en texto plano:
                // Valida y migra transparentemente el hash a BCrypt en la base de datos
                passwordMatches = true;
                user.setPassword(passwordEncoder.encode(rawPassword));
                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            Map<String, String> error = Collections.singletonMap(
                    "message", "Contraseña incorrecta. Verifique sus credenciales.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Generar token de sesión persistible
        String sessionToken = "session-" + user.getRole().toLowerCase() + "-"
                + UUID.randomUUID().toString().substring(0, 8);

        AuthResponseDTO response = new AuthResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                sessionToken
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify/{id}")
    public ResponseEntity<?> verifySession(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    AuthResponseDTO response = new AuthResponseDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getFullName(),
                            user.getEmail(),
                            user.getRole(),
                            "verified"
                    );
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
