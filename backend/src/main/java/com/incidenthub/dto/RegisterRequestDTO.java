package com.incidenthub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for User Registration request.
 */
public class RegisterRequestDTO {

    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres.")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres.")
    private String password;

    @NotBlank(message = "El nombre completo es obligatorio.")
    @Size(max = 100, message = "El nombre completo no debe exceder 100 caracteres.")
    private String fullName;

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "El formato del correo electrónico es inválido.")
    @Size(max = 100, message = "El correo electrónico no debe exceder 100 caracteres.")
    private String email;

    @NotBlank(message = "El rol es obligatorio (ADMIN o TECHNICIAN).")
    private String role;

    public RegisterRequestDTO() {
    }

    public RegisterRequestDTO(String username, String password, String fullName, String email, String role) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
