package com.incidenthub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incidenthub.dto.LoginRequestDTO;
import com.incidenthub.dto.RegisterRequestDTO;
import com.incidenthub.dto.UserDTO;
import com.incidenthub.model.User;
import com.incidenthub.repository.UserRepository;
import com.incidenthub.service.UserService;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller unit tests for AuthController.
 * Validates registration, authentication, session verification and security response sanitization.
 */
@WebMvcTest(AuthController.class)
@Import(com.incidenthub.config.SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @Test
    @DisplayName("POST /api/v1/auth/register debe retornar 201 y no exponer la contrasena")
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "analistasec", "claveSegura123", "Analista de Seguridad", "analista@incidenthub.io", "ADMIN"
        );

        UserDTO createdDto = new UserDTO(
                100L, "analistasec", "Analista de Seguridad", "analista@incidenthub.io", "ADMIN"
        );

        when(userService.registerUser(any(RegisterRequestDTO.class))).thenReturn(createdDto);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(100)))
                .andExpect(jsonPath("$.username", is("analistasec")))
                .andExpect(jsonPath("$.role", is("ADMIN")))
                .andExpect(jsonPath("$.token", startsWith("session-admin-")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register debe retornar 400 Bad Request si faltan campos obligatorios")
    void shouldFailRegistrationWhenValidationFails() throws Exception {
        RegisterRequestDTO invalidRequest = new RegisterRequestDTO();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login debe retornar 200 OK y sessionToken con contrasena BCrypt valida")
    void shouldLoginSuccessfullyWithValidBcryptCredentials() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("tecnico1", "claveCorrecta123");
        String bCryptHash = passwordEncoder.encode("claveCorrecta123");
        User user = new User(5L, "tecnico1", bCryptHash, "Tecnico Uno", "tecnico1@incidenthub.io", "TECHNICIAN");

        when(userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("tecnico1", "tecnico1"))
                .thenReturn(Optional.of(user));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(5)))
                .andExpect(jsonPath("$.username", is("tecnico1")))
                .andExpect(jsonPath("$.role", is("TECHNICIAN")))
                .andExpect(jsonPath("$.token", startsWith("session-technician-")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login debe retornar 200 OK y migrar hash si el usuario tenia contrasena en texto plano")
    void shouldLoginAndMigrateLegacyPlaintextPassword() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("legacyUser", "legacyPass123");
        User user = new User(6L, "legacyUser", "legacyPass123", "Legacy User", "legacy@incidenthub.io", "TECHNICIAN");

        when(userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("legacyUser", "legacyUser"))
                .thenReturn(Optional.of(user));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(6)))
                .andExpect(jsonPath("$.username", is("legacyUser")))
                .andExpect(jsonPath("$.password").doesNotExist());

        // Verificar que se llamó a save para persistir el nuevo hash BCrypt
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("POST /api/v1/auth/login debe retornar 401 Unauthorized cuando la contrasena BCrypt es incorrecta")
    void shouldRejectLoginWithInvalidPassword() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("tecnico1", "claveErronea999");
        String bCryptHash = passwordEncoder.encode("claveCorrecta123");
        User user = new User(5L, "tecnico1", bCryptHash, "Tecnico Uno", "tecnico1@incidenthub.io", "TECHNICIAN");

        when(userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("tecnico1", "tecnico1"))
                .thenReturn(Optional.of(user));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Contraseña incorrecta. Verifique sus credenciales.")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login debe retornar 401 Unauthorized cuando el usuario no existe")
    void shouldRejectLoginWhenUserNotFound() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("inexistente", "cualquierClave");

        when(userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("inexistente", "inexistente"))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Usuario no encontrado en la base de datos.")));
    }

    @Test
    @DisplayName("GET /api/v1/auth/verify/{id} debe retornar 200 OK para usuario existente")
    void shouldVerifySessionForExistingUser() throws Exception {
        User user = new User(10L, "operador", "pass", "Operador NOC", "noc@incidenthub.io", "TECHNICIAN");

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/auth/verify/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.username", is("operador")))
                .andExpect(jsonPath("$.token", is("verified")))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/v1/auth/verify/{id} debe retornar 401 Unauthorized si el usuario no existe")
    void shouldReturnUnauthorizedWhenVerifyingNonExistingUser() throws Exception {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/auth/verify/999"))
                .andExpect(status().isUnauthorized());
    }
}
