package com.incidenthub.service;

import com.incidenthub.dto.RegisterRequestDTO;
import com.incidenthub.dto.UserDTO;
import java.util.List;

/**
 * Service interface for User / Technician operations.
 */
public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO registerUser(RegisterRequestDTO request);
}
