package com.incidenthub.service;

import com.incidenthub.dto.AssignTechnicianRequestDTO;
import com.incidenthub.dto.IncidentRequestDTO;
import com.incidenthub.dto.IncidentResponseDTO;
import com.incidenthub.dto.StatusUpdateRequestDTO;
import com.incidenthub.exception.BadRequestException;
import com.incidenthub.exception.ResourceNotFoundException;
import com.incidenthub.model.Category;
import com.incidenthub.model.Comment;
import com.incidenthub.model.Incident;
import com.incidenthub.model.Priority;
import com.incidenthub.model.Status;
import com.incidenthub.model.User;
import com.incidenthub.repository.CommentRepository;
import com.incidenthub.repository.IncidentRepository;
import com.incidenthub.repository.UserRepository;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for IncidentServiceImpl using Mockito.
 */
@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncidentServiceImpl incidentService;

    private Incident sampleIncident;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User(1L, "cgomez", "Carlos Gomez", "carlos.gomez.devops@incidenthub.io", "TECHNICIAN");

        sampleIncident = new Incident();
        sampleIncident.setId(10L);
        sampleIncident.setTitle("Falla en switch de red");
        sampleIncident.setDescription("Puerto gigabit 1 sin enlace");
        sampleIncident.setCategory(Category.NETWORK);
        sampleIncident.setPriority(Priority.ALTA);
        sampleIncident.setStatus(Status.NUEVO);
        sampleIncident.setReporterName("Laura Mendoza");
    }

    @Test
    @DisplayName("Debe crear un incidente en estado NUEVO exitosamente")
    void shouldCreateIncidentSuccessfully() {
        IncidentRequestDTO requestDTO = new IncidentRequestDTO(
                "Falla en switch de red",
                "Puerto gigabit 1 sin enlace",
                Category.NETWORK,
                Priority.ALTA,
                "Laura Mendoza",
                null
        );

        when(incidentRepository.save(any(Incident.class))).thenReturn(sampleIncident);
        when(commentRepository.save(any(Comment.class))).thenReturn(new Comment());

        IncidentResponseDTO response = incidentService.createIncident(requestDTO);

        assertNotNull(response);
        assertEquals("Falla en switch de red", response.getTitle());
        assertEquals(Status.NUEVO, response.getStatus());
        verify(incidentRepository).save(any(Incident.class));
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Debe actualizar el estado del incidente a EN_PROCESO")
    void shouldUpdateStatusSuccessfully() {
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));
        when(incidentRepository.save(any(Incident.class))).thenReturn(sampleIncident);
        when(commentRepository.findByIncidentIdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());

        StatusUpdateRequestDTO updateDTO = new StatusUpdateRequestDTO(
                Status.EN_PROCESO, "Carlos Gomez", "Iniciando revision fisica de cableado");

        IncidentResponseDTO result = incidentService.updateStatus(10L, updateDTO);

        assertNotNull(result);
        assertEquals(Status.EN_PROCESO, sampleIncident.getStatus());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Debe lanzar BadRequestException si el nuevo estado es igual al actual")
    void shouldThrowBadRequestWhenStatusUnchanged() {
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));

        StatusUpdateRequestDTO updateDTO = new StatusUpdateRequestDTO(
                Status.NUEVO, "Carlos Gomez", "Sin cambio");

        assertThrows(BadRequestException.class, () -> incidentService.updateStatus(10L, updateDTO));
    }

    @Test
    @DisplayName("Debe asignar tecnico y cambiar estado a ASIGNADO si estaba NUEVO")
    void shouldAssignTechnicianSuccessfully() {
        when(incidentRepository.findById(10L)).thenReturn(Optional.of(sampleIncident));
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(incidentRepository.save(any(Incident.class))).thenReturn(sampleIncident);
        when(commentRepository.findByIncidentIdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());

        AssignTechnicianRequestDTO assignDTO = new AssignTechnicianRequestDTO(1L, "Admin General");
        IncidentResponseDTO result = incidentService.assignTechnician(10L, assignDTO);

        assertNotNull(result);
        assertEquals(Status.ASIGNADO, sampleIncident.getStatus());
        assertEquals(sampleUser, sampleIncident.getAssignedTechnician());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el incidente no existe")
    void shouldThrowNotFoundWhenIncidentDoesNotExist() {
        when(incidentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> incidentService.getIncidentById(999L));
    }
}
