package com.incidenthub.service;

import com.incidenthub.dto.RegisterRequestDTO;
import com.incidenthub.dto.UserDTO;
import com.incidenthub.exception.BadRequestException;
import com.incidenthub.exception.ResourceNotFoundException;
import com.incidenthub.model.User;
import com.incidenthub.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of UserService.
 */
@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return mapToDTO(user);
    }

    @Override
    @Transactional
    public UserDTO registerUser(RegisterRequestDTO request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();
        String role = request.getRole().trim().toUpperCase();

        if (!"ADMIN".equals(role) && !"TECHNICIAN".equals(role)) {
            throw new BadRequestException("El rol seleccionado debe ser 'ADMIN' o 'TECHNICIAN'.");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            throw new BadRequestException("El nombre de usuario '" + username + "' ya se encuentra registrado.");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("El correo electrónico '" + email + "' ya se encuentra registrado.");
        }

        User newUser = new User(
                null,
                username,
                request.getPassword().trim(),
                request.getFullName().trim(),
                email,
                role
        );

        User savedUser = userRepository.save(newUser);
        return mapToDTO(savedUser);
    }

    private UserDTO mapToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
