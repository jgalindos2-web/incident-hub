package com.incidenthub.service;

import com.incidenthub.dto.AssignTechnicianRequestDTO;
import com.incidenthub.dto.CommentRequestDTO;
import com.incidenthub.dto.CommentResponseDTO;
import com.incidenthub.dto.DashboardStatsDTO;
import com.incidenthub.dto.IncidentRequestDTO;
import com.incidenthub.dto.IncidentResponseDTO;
import com.incidenthub.dto.StatusUpdateRequestDTO;
import com.incidenthub.dto.UserDTO;
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
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation managing incidents, comments, transitions and dashboard metrics.
 */
@Service
@Transactional
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public IncidentServiceImpl(IncidentRepository incidentRepository,
                               CommentRepository commentRepository,
                               UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public IncidentResponseDTO createIncident(IncidentRequestDTO requestDTO) {
        Incident incident = new Incident();
        incident.setTitle(requestDTO.getTitle().trim());
        incident.setDescription(requestDTO.getDescription().trim());
        incident.setCategory(requestDTO.getCategory());
        incident.setPriority(requestDTO.getPriority());
        incident.setReporterName(requestDTO.getReporterName().trim());
        incident.setStatus(Status.NUEVO);

        if (requestDTO.getAssignedTechnicianId() != null) {
            User tech = userRepository.findById(requestDTO.getAssignedTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Técnico no encontrado con ID: " + requestDTO.getAssignedTechnicianId()));
            incident.setAssignedTechnician(tech);
            incident.setStatus(Status.ASIGNADO);
        }

        Incident saved = incidentRepository.save(incident);

        // Add creation audit comment
        Comment creationComment = new Comment(
                saved,
                requestDTO.getReporterName(),
                "Incidente creado en estado inicial " + saved.getStatus(),
                "CREATION"
        );
        commentRepository.save(creationComment);

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentResponseDTO getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con ID: " + id));
        return mapToDTO(incident);
    }

    // Aqui se realizo task #4: Servicio para consultar listado general de incidentes
    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponseDTO> getIncidents(Status status, Priority priority,
                                                 Category category, Long technicianId) {
        return incidentRepository.findWithFilters(status, priority, category, technicianId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public IncidentResponseDTO updateStatus(Long id, StatusUpdateRequestDTO requestDTO) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con ID: " + id));

        Status oldStatus = incident.getStatus();
        Status newStatus = requestDTO.getStatus();

        if (oldStatus == newStatus) {
            throw new BadRequestException("El incidente ya se encuentra en estado: " + newStatus);
        }

        incident.setStatus(newStatus);
        ZonedDateTime now = ZonedDateTime.now();

        if (newStatus == Status.RESUELTO) {
            incident.setResolvedAt(now);
            if (requestDTO.getNotes() != null && !requestDTO.getNotes().isBlank()) {
                incident.setResolutionNotes(requestDTO.getNotes());
            }
        } else if (newStatus == Status.CERRADO) {
            incident.setClosedAt(now);
        }

        Incident updated = incidentRepository.save(incident);

        String msg = String.format("Estado cambiado de %s a %s. %s",
                oldStatus, newStatus,
                (requestDTO.getNotes() != null ? "Nota: " + requestDTO.getNotes() : ""));

        Comment audit = new Comment(updated, requestDTO.getAuthorName(), msg, "STATUS_CHANGE");
        commentRepository.save(audit);

        return mapToDTO(updated);
    }

    // Aqui se realizo task #6: Habilitar la lógica backend para asignar un técnico a un incidente
    @Override
    public IncidentResponseDTO assignTechnician(Long id, AssignTechnicianRequestDTO requestDTO) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con ID: " + id));

        User tech = userRepository.findById(requestDTO.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Técnico no encontrado con ID: " + requestDTO.getTechnicianId()));

        // Aqui se realizo task #6: Modificar assigned_technician_id y transicionar status = 'ASIGNADO'
        incident.setAssignedTechnician(tech);
        if (incident.getStatus() == Status.NUEVO) {
            incident.setStatus(Status.ASIGNADO);
        }

        Incident saved = incidentRepository.save(incident);

        // Aqui se realizo task #6: Insertar registro automático en incident_comments con action_type = 'ASSIGNMENT'
        String msg = String.format("Incidente asignado al técnico: %s (%s)",
                tech.getFullName(), tech.getEmail());
        Comment audit = new Comment(saved, requestDTO.getAssignedByName(), msg, "ASSIGNMENT");
        commentRepository.save(audit);

        return mapToDTO(saved);
    }

    @Override
    public CommentResponseDTO addComment(Long id, CommentRequestDTO requestDTO) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con ID: " + id));

        Comment comment = new Comment(
                incident,
                requestDTO.getAuthorName(),
                requestDTO.getMessage(),
                requestDTO.getActionType() != null ? requestDTO.getActionType() : "COMMENT"
        );

        Comment saved = commentRepository.save(comment);
        return mapCommentToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getIncidentComments(Long id) {
        if (!incidentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Incidente no encontrado con ID: " + id);
        }
        return commentRepository.findByIncidentIdOrderByCreatedAtDesc(id).stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long total = incidentRepository.count();
        long nuevos = incidentRepository.countByStatus(Status.NUEVO);
        long asignados = incidentRepository.countByStatus(Status.ASIGNADO);
        long enProceso = incidentRepository.countByStatus(Status.EN_PROCESO);
        long resueltos = incidentRepository.countByStatus(Status.RESUELTO);
        long cerrados = incidentRepository.countByStatus(Status.CERRADO);

        long open = nuevos + asignados + enProceso;
        long closed = resueltos + cerrados;
        long critical = incidentRepository.countByPriority(Priority.CRITICA);

        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("NUEVO", nuevos);
        statusMap.put("ASIGNADO", asignados);
        statusMap.put("EN_PROCESO", enProceso);
        statusMap.put("RESUELTO", resueltos);
        statusMap.put("CERRADO", cerrados);

        Map<String, Long> categoryMap = new HashMap<>();
        for (Object[] row : incidentRepository.countGroupedByCategory()) {
            categoryMap.put(row[0].toString(), (Long) row[1]);
        }

        Map<String, Long> techMap = new HashMap<>();
        for (Object[] row : incidentRepository.countGroupedByTechnician()) {
            techMap.put(row[0].toString(), (Long) row[1]);
        }

        return new DashboardStatsDTO(total, open, closed, critical, categoryMap, techMap, statusMap);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getTechnicianStats(Long technicianId) {
        List<Incident> techIncidents = incidentRepository.findWithFilters(null, null, null, technicianId);

        long total = techIncidents.size();
        long open = techIncidents.stream()
                .filter(i -> i.getStatus() == Status.NUEVO
                        || i.getStatus() == Status.ASIGNADO
                        || i.getStatus() == Status.EN_PROCESO)
                .count();
        long closed = techIncidents.stream()
                .filter(i -> i.getStatus() == Status.RESUELTO || i.getStatus() == Status.CERRADO)
                .count();
        long critical = techIncidents.stream()
                .filter(i -> i.getPriority() == Priority.CRITICA)
                .count();

        Map<String, Long> statusMap = new HashMap<>();
        for (Status s : Status.values()) {
            long count = techIncidents.stream().filter(i -> i.getStatus() == s).count();
            statusMap.put(s.name(), count);
        }

        Map<String, Long> categoryMap = new HashMap<>();
        for (Category c : Category.values()) {
            long count = techIncidents.stream().filter(i -> i.getCategory() == c).count();
            if (count > 0) {
                categoryMap.put(c.name(), count);
            }
        }

        Map<String, Long> techMap = new HashMap<>();
        techMap.put("Mis Asignaciones", total);

        return new DashboardStatsDTO(total, open, closed, critical, categoryMap, techMap, statusMap);
    }

    @Override
    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con ID: " + id));
        incidentRepository.delete(incident);
    }

    // Aqui se realizo task #4: Mapear la respuesta en formato JSON con los atributos: id, title, category, priority, status, reporter_name, assigned_technician, created_at
    private IncidentResponseDTO mapToDTO(Incident incident) {
        IncidentResponseDTO dto = new IncidentResponseDTO();
        dto.setId(incident.getId());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setCategory(incident.getCategory());
        dto.setPriority(incident.getPriority());
        dto.setStatus(incident.getStatus());
        dto.setReporterName(incident.getReporterName());
        dto.setResolutionNotes(incident.getResolutionNotes());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        dto.setResolvedAt(incident.getResolvedAt());
        dto.setClosedAt(incident.getClosedAt());

        if (incident.getAssignedTechnician() != null) {
            User tech = incident.getAssignedTechnician();
            dto.setAssignedTechnician(new UserDTO(
                    tech.getId(), tech.getUsername(), tech.getFullName(), tech.getEmail(), tech.getRole()));
        }

        List<CommentResponseDTO> comments = commentRepository
                .findByIncidentIdOrderByCreatedAtDesc(incident.getId())
                .stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());
        dto.setComments(comments);

        return dto;
    }

    private CommentResponseDTO mapCommentToDTO(Comment comment) {
        return new CommentResponseDTO(
                comment.getId(),
                comment.getIncident().getId(),
                comment.getAuthorName(),
                comment.getMessage(),
                comment.getActionType(),
                comment.getCreatedAt()
        );
    }
}
