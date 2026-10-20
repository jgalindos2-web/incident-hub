package com.incidenthub.dto;

import com.incidenthub.model.Category;
import com.incidenthub.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating or updating an incident.
 */
public class IncidentRequestDTO {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotNull(message = "La categoría es obligatoria")
    private Category category;

    @NotNull(message = "La prioridad es obligatoria")
    private Priority priority;

    @NotBlank(message = "El nombre del usuario reportante es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String reporterName;

    private Long assignedTechnicianId;

    public IncidentRequestDTO() {
    }

    public IncidentRequestDTO(String title, String description, Category category,
                              Priority priority, String reporterName, Long assignedTechnicianId) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.reporterName = reporterName;
        this.assignedTechnicianId = assignedTechnicianId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public Long getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(Long assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }
}
