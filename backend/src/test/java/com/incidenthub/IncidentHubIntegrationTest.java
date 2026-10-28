package com.incidenthub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incidenthub.dto.AssignTechnicianRequestDTO;
import com.incidenthub.dto.IncidentRequestDTO;
import com.incidenthub.dto.StatusUpdateRequestDTO;
import com.incidenthub.model.Category;
import com.incidenthub.model.Priority;
import com.incidenthub.model.User;
import com.incidenthub.repository.IncidentRepository;
import com.incidenthub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-End Integration Test for Incident Hub using In-Memory H2 Database.
 * Validates complete lifecycle: Creation -> Assignment -> Resolution -> Dashboard Stats.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IncidentHubIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private UserRepository userRepository;

    private User sampleTechnician;

    @BeforeEach
    void setup() {
        incidentRepository.deleteAll();
        userRepository.deleteAll();

        sampleTechnician = new User();
        sampleTechnician.setUsername("jgalindos2");
        sampleTechnician.setFullName("Juan Carlos Galindo");
        sampleTechnician.setEmail("jgalindos2@miumg.edu.gt");
        sampleTechnician.setRole("FULL_STACK_LEAD");
        sampleTechnician = userRepository.save(sampleTechnician);
    }

    @Test
    @DisplayName("Integración: Flujo completo de ciclo de vida de un incidente y métricas")
    void testCompleteIncidentLifecycleIntegration() throws Exception {
        // 1. Crear nuevo incidente vía POST
        IncidentRequestDTO createDto = new IncidentRequestDTO(
                "Caída de switch en Data Center Principal",
                "Problema en fuente de poder redundante del switch Cisco Nexus",
                Category.NETWORK,
                Priority.CRITICA,
                "Beatriz Mendoza",
                null
        );

        MvcResult createResult = mockMvc.perform(post("/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Caída de switch en Data Center Principal")))
                .andExpect(jsonPath("$.status", is("NUEVO")))
                .andReturn();

        String responseJson = createResult.getResponse().getContentAsString();
        Long incidentId = objectMapper.readTree(responseJson).get("id").asLong();
        assertNotNull(incidentId);

        // 2. Asignar incidente al técnico vía PATCH
        AssignTechnicianRequestDTO assignDto = new AssignTechnicianRequestDTO();
        assignDto.setTechnicianId(sampleTechnician.getId());
        assignDto.setAssignedByName("Coordinador IT");

        mockMvc.perform(patch("/incidents/" + incidentId + "/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ASIGNADO")))
                .andExpect(jsonPath("$.assignedTechnician.username", is("jgalindos2")));

        // 3. Actualizar estado a RESUELTO vía PATCH
        StatusUpdateRequestDTO statusDto = new StatusUpdateRequestDTO();
        statusDto.setStatus(com.incidenthub.model.Status.RESUELTO);
        statusDto.setAuthorName("Juan Carlos Galindo");
        statusDto.setNotes("Fuente de poder reemplazada y switch operando normalmente");

        mockMvc.perform(patch("/incidents/" + incidentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESUELTO")))
                .andExpect(jsonPath("$.resolutionNotes", is("Fuente de poder reemplazada y switch operando normalmente")));

        // 4. Validar que las métricas del dashboard reflejan el incidente resuelto
        mockMvc.perform(get("/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncidents", is(1)))
                .andExpect(jsonPath("$.closedIncidents", is(1)))
                .andExpect(jsonPath("$.openIncidents", is(0)));
    }

    @Test
    @DisplayName("Debe registrar un nuevo usuario ADMIN y TECHNICIAN exitosamente y rechazar duplicados")
    void shouldRegisterUsersSuccessfully() throws Exception {
        com.incidenthub.dto.RegisterRequestDTO adminRequest = new com.incidenthub.dto.RegisterRequestDTO(
                "superadmin", "securePass123", "Super Admin", "superadmin@incidenthub.io", "ADMIN");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("superadmin")))
                .andExpect(jsonPath("$.role", is("ADMIN")))
                .andExpect(jsonPath("$.email", is("superadmin@incidenthub.io")));

        com.incidenthub.dto.RegisterRequestDTO techRequest = new com.incidenthub.dto.RegisterRequestDTO(
                "nuevotech", "securePass123", "Nuevo Tecnico", "nuevotech@incidenthub.io", "TECHNICIAN");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(techRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("nuevotech")))
                .andExpect(jsonPath("$.role", is("TECHNICIAN")));

        // Intento de duplicado de username
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Actuator: Health endpoint responde UP y no expone detalles internos ni de base de datos")
    void shouldValidateActuatorHealthWithoutLeakingInternalDetails() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.components").doesNotExist());
    }
}
