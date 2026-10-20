package com.incidenthub.service;

import com.incidenthub.dto.AssignTechnicianRequestDTO;
import com.incidenthub.dto.CommentRequestDTO;
import com.incidenthub.dto.CommentResponseDTO;
import com.incidenthub.dto.DashboardStatsDTO;
import com.incidenthub.dto.IncidentRequestDTO;
import com.incidenthub.dto.IncidentResponseDTO;
import com.incidenthub.dto.StatusUpdateRequestDTO;
import com.incidenthub.model.Category;
import com.incidenthub.model.Priority;
import com.incidenthub.model.Status;
import java.util.List;

/**
 * Service interface for Incident and Dashboard operations.
 */
public interface IncidentService {
    IncidentResponseDTO createIncident(IncidentRequestDTO requestDTO);
    IncidentResponseDTO getIncidentById(Long id);
    List<IncidentResponseDTO> getIncidents(Status status, Priority priority, Category category, Long technicianId);
    IncidentResponseDTO updateStatus(Long id, StatusUpdateRequestDTO requestDTO);
    IncidentResponseDTO assignTechnician(Long id, AssignTechnicianRequestDTO requestDTO);
    CommentResponseDTO addComment(Long id, CommentRequestDTO requestDTO);
    List<CommentResponseDTO> getIncidentComments(Long id);
    DashboardStatsDTO getDashboardStats();
    DashboardStatsDTO getTechnicianStats(Long technicianId);
    void deleteIncident(Long id);
}
