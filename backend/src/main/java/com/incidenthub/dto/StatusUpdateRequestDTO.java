package com.incidenthub.dto;

import com.incidenthub.model.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for updating incident status with notes and author tracking.
 */
public class StatusUpdateRequestDTO {

    @NotNull(message = "El nuevo estado es obligatorio")
    private Status status;

    @NotBlank(message = "El autor del cambio es obligatorio")
    private String authorName;

    private String notes;

    public StatusUpdateRequestDTO() {
    }

    public StatusUpdateRequestDTO(Status status, String authorName, String notes) {
        this.status = status;
        this.authorName = authorName;
        this.notes = notes;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
