package com.incidenthub.dto;

import java.time.ZonedDateTime;

/**
 * DTO for displaying an incident comment / audit log.
 */
public class CommentResponseDTO {
    private Long id;
    private Long incidentId;
    private String authorName;
    private String message;
    private String actionType;
    private ZonedDateTime createdAt;

    public CommentResponseDTO() {
    }

    public CommentResponseDTO(Long id, Long incidentId, String authorName,
                              String message, String actionType, ZonedDateTime createdAt) {
        this.id = id;
        this.incidentId = incidentId;
        this.authorName = authorName;
        this.message = message;
        this.actionType = actionType;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
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

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
