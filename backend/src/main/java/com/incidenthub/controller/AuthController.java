package com.incidenthub.controller;

import com.incidenthub.dto.AuthResponseDTO;
import com.incidenthub.dto.LoginRequestDTO;
import com.incidenthub.model.User;
import com.incidenthub.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        // Validación de contraseña en base de datos
        if (!user.getPassword().equals(request.getPassword().trim())) {
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
