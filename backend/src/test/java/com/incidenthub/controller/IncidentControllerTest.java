package com.incidenthub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incidenthub.dto.IncidentRequestDTO;
import com.incidenthub.dto.IncidentResponseDTO;
import com.incidenthub.model.Category;
import com.incidenthub.model.Priority;
import com.incidenthub.model.Status;
import com.incidenthub.service.IncidentService;
import java.util.Collections;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller tests for IncidentController using MockMvc.
 */
@WebMvcTest(IncidentController.class)
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IncidentService incidentService;

    @Test
    @DisplayName("POST /api/v1/incidents debe retornar 201 Created")
    void shouldCreateIncidentAndReturn201() throws Exception {
        IncidentRequestDTO requestDTO = new IncidentRequestDTO(
                "Impresora sin toner",
                "Piso 2 Recursos Humanos",
                Category.HARDWARE,
                Priority.MEDIA,
                "Juan Perez",
                null
        );

        IncidentResponseDTO responseDTO = new IncidentResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setTitle("Impresora sin toner");
        responseDTO.setCategory(Category.HARDWARE);
        responseDTO.setPriority(Priority.MEDIA);
        responseDTO.setStatus(Status.NUEVO);
        responseDTO.setReporterName("Juan Perez");

        when(incidentService.createIncident(any(IncidentRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Impresora sin toner"))
                .andExpect(jsonPath("$.status").value("NUEVO"));
    }

    @Test
    @DisplayName("GET /api/v1/incidents debe retornar lista de incidentes y 200 OK")
    void shouldReturnIncidentList() throws Exception {
        when(incidentService.getIncidents(null, null, null, null))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/incidents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
