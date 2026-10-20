package com.incidenthub.dto;

import com.incidenthub.model.Category;
import com.incidenthub.model.Priority;
import com.incidenthub.model.Status;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * Incident response representation DTO.
 */
// Aqui se realizo task #4: Mapear la respuesta en formato JSON con los atributos: id, title, category, priority, status, reporter_name, assigned_technician, created_at
public class IncidentResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private Status status;
    private String reporterName;
    private UserDTO assignedTechnician;
    private String resolutionNotes;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private ZonedDateTime resolvedAt;
    private ZonedDateTime closedAt;
    private List<CommentResponseDTO> comments;

    public IncidentResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public UserDTO getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(UserDTO assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public ZonedDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(ZonedDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public ZonedDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(ZonedDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public List<CommentResponseDTO> getComments() {
        return comments;
    }

    public void setComments(List<CommentResponseDTO> comments) {
        this.comments = comments;
    }
}
