package com.incidenthub.controller;

import com.incidenthub.dto.AssignTechnicianRequestDTO;
import com.incidenthub.dto.CommentRequestDTO;
import com.incidenthub.dto.CommentResponseDTO;
import com.incidenthub.dto.IncidentRequestDTO;
import com.incidenthub.dto.IncidentResponseDTO;
import com.incidenthub.dto.StatusUpdateRequestDTO;
import com.incidenthub.model.Category;
import com.incidenthub.model.Priority;
import com.incidenthub.model.Status;
import com.incidenthub.service.IncidentService;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Incident Operations with Role-Based Access Control (RBAC).
 */
@RestController
@RequestMapping("/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponseDTO> createIncident(@Valid @RequestBody IncidentRequestDTO dto) {
        IncidentResponseDTO created = incidentService.createIncident(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<?> getIncidents(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Long technicianId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        // Si el rol es TECHNICIAN: solo puede consultar sus propios incidentes asignados
        if (role != null && role.equalsIgnoreCase("TECHNICIAN")) {
            Long effectiveTechId = (technicianId != null) ? technicianId : userId;
            if (userId != null && !userId.equals(effectiveTechId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("message",
                                "Acceso denegado: los técnicos solo pueden consultar sus incidentes asignados."));
            }
            List<IncidentResponseDTO> list = incidentService.getIncidents(status, priority, category, effectiveTechId);
            return ResponseEntity.ok(list);
        }

        List<IncidentResponseDTO> list = incidentService.getIncidents(status, priority, category, technicianId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponseDTO> getIncidentById(@PathVariable Long id) {
        IncidentResponseDTO incident = incidentService.getIncidentById(id);
        return ResponseEntity.ok(incident);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequestDTO dto) {
        IncidentResponseDTO updated = incidentService.updateStatus(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequestDTO dto,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // Validación de permisos: Solo ADMIN puede asignar o reasignar técnicos
        if (role != null && !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("message",
                            "Acceso denegado: solo el Administrador cuenta con permisos para asignar técnicos."));
        }

        IncidentResponseDTO updated = incidentService.assignTechnician(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncident(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        // Validación de permisos: Solo ADMIN puede eliminar incidentes
        if (role != null && !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("message",
                            "Acceso denegado: solo el Administrador cuenta con permisos para eliminar incidentes."));
        }

        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequestDTO dto) {
        CommentResponseDTO created = incidentService.addComment(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getIncidentComments(@PathVariable Long id) {
        List<CommentResponseDTO> comments = incidentService.getIncidentComments(id);
        return ResponseEntity.ok(comments);
    }
}
