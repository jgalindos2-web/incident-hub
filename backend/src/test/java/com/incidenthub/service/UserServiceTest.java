package com.incidenthub.service;

import com.incidenthub.dto.RegisterRequestDTO;
import com.incidenthub.dto.UserDTO;
import com.incidenthub.exception.BadRequestException;
import com.incidenthub.model.User;
import com.incidenthub.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for UserServiceImpl and password hashing security.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserServiceImpl(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("registerUser debe almacenar la contrasena hasheada con BCrypt y no en texto plano")
    void shouldHashPasswordWithBcryptWhenRegistering() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "nuevousuario", "MiClaveSecreta123!", "Juan Perez", "juan.perez@incidenthub.io", "TECHNICIAN"
        );

        when(userRepository.findByUsername("nuevousuario")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("juan.perez@incidenthub.io")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User userToSave = invocation.getArgument(0);
            userToSave.setId(42L);
            return userToSave;
        });

        UserDTO result = userService.registerUser(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(42L);
        assertThat(result.getUsername()).isEqualTo("nuevousuario");

        // Capturar entidad guardada en el repositorio
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getPassword()).isNotNull();
        // Verificar que la contraseña no sea igual al texto original
        assertThat(savedUser.getPassword()).isNotEqualTo("MiClaveSecreta123!");
        // Verificar prefijo de hash BCrypt
        assertThat(savedUser.getPassword()).startsWith("$2a$");
        // Verificar coincidencia criptográfica
        assertThat(passwordEncoder.matches("MiClaveSecreta123!", savedUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("registerUser debe rechazar roles no permitidos")
    void shouldRejectInvalidRole() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "hacker", "clave12345", "Attacker", "attacker@evil.com", "SUPERADMIN"
        );

        assertThatThrownBy(() -> userService.registerUser(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("El rol seleccionado debe ser 'ADMIN' o 'TECHNICIAN'.");
    }

    @Test
    @DisplayName("registerUser debe rechazar nombre de usuario duplicado")
    void shouldRejectDuplicateUsername() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "duplicado", "clave12345", "Test User", "test@incidenthub.io", "TECHNICIAN"
        );

        when(userRepository.findByUsername("duplicado"))
                .thenReturn(Optional.of(new User(1L, "duplicado", "pass", "Test", "t@i.io", "TECHNICIAN")));

        assertThatThrownBy(() -> userService.registerUser(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ya se encuentra registrado");
    }

    @Test
    @DisplayName("BCryptPasswordEncoder debe generar hashes verificables para credenciales de seed")
    void shouldGenerateAndVerifySeedCredentials() {
        String adminHash = passwordEncoder.encode("admin123");
        String techHash = passwordEncoder.encode("tech123");

        assertThat(passwordEncoder.matches("admin123", adminHash)).isTrue();
        assertThat(passwordEncoder.matches("tech123", techHash)).isTrue();
        assertThat(passwordEncoder.matches("wrongPass", adminHash)).isFalse();
    }
}
