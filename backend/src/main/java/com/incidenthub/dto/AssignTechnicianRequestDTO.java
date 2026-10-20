package com.incidenthub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for assigning a technician to an incident.
 */
public class AssignTechnicianRequestDTO {

    // Aqui se realizo task #6: Recibir el assigned_technician_id (relacionado a app_users.id) en el cuerpo de la peticion
    @NotNull(message = "El ID del técnico es obligatorio")
    private Long technicianId;

    @NotBlank(message = "El nombre de quien asigna es obligatorio")
    private String assignedByName;

    public AssignTechnicianRequestDTO() {
    }

    public AssignTechnicianRequestDTO(Long technicianId, String assignedByName) {
        this.technicianId = technicianId;
        this.assignedByName = assignedByName;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public void setAssignedByName(String assignedByName) {
        this.assignedByName = assignedByName;
    }
}
