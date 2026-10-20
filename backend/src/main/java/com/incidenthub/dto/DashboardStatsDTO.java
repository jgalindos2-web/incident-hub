package com.incidenthub.dto;

import java.util.Map;

/**
 * DTO providing aggregated statistics for the management dashboard.
 */
public class DashboardStatsDTO {
    private long totalIncidents;
    private long openIncidents;
    private long closedIncidents;
    private long criticalIncidents;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> technicianDistribution;
    private Map<String, Long> statusDistribution;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(long totalIncidents, long openIncidents, long closedIncidents,
                             long criticalIncidents, Map<String, Long> categoryDistribution,
                             Map<String, Long> technicianDistribution,
                             Map<String, Long> statusDistribution) {
        this.totalIncidents = totalIncidents;
        this.openIncidents = openIncidents;
        this.closedIncidents = closedIncidents;
        this.criticalIncidents = criticalIncidents;
        this.categoryDistribution = categoryDistribution;
        this.technicianDistribution = technicianDistribution;
        this.statusDistribution = statusDistribution;
    }

    public long getTotalIncidents() {
        return totalIncidents;
    }

    public void setTotalIncidents(long totalIncidents) {
        this.totalIncidents = totalIncidents;
    }

    public long getOpenIncidents() {
        return openIncidents;
    }

    public void setOpenIncidents(long openIncidents) {
        this.openIncidents = openIncidents;
    }

    public long getClosedIncidents() {
        return closedIncidents;
    }

    public void setClosedIncidents(long closedIncidents) {
        this.closedIncidents = closedIncidents;
    }

    public long getCriticalIncidents() {
        return criticalIncidents;
    }

    public void setCriticalIncidents(long criticalIncidents) {
        this.criticalIncidents = criticalIncidents;
    }

    public Map<String, Long> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Long> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public Map<String, Long> getTechnicianDistribution() {
        return technicianDistribution;
    }

    public void setTechnicianDistribution(Map<String, Long> technicianDistribution) {
        this.technicianDistribution = technicianDistribution;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }
}
