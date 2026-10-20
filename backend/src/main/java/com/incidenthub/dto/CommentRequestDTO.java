package com.incidenthub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a comment in an incident.
 */
public class CommentRequestDTO {

    @NotBlank(message = "El nombre del autor es obligatorio")
    @Size(max = 100, message = "El nombre del autor no puede superar 100 caracteres")
    private String authorName;

    @NotBlank(message = "El mensaje no puede estar vacío")
    private String message;

    private String actionType;

    public CommentRequestDTO() {
    }

    public CommentRequestDTO(String authorName, String message, String actionType) {
        this.authorName = authorName;
        this.message = message;
        this.actionType = actionType;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }
}
