package com.incidenthub.controller;

import com.incidenthub.dto.DashboardStatsDTO;
import com.incidenthub.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller providing aggregated dashboard statistics.
 */
@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final IncidentService incidentService;

    public DashboardController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        DashboardStatsDTO stats = incidentService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/technician/{technicianId}")
    public ResponseEntity<DashboardStatsDTO> getTechnicianStats(@PathVariable Long technicianId) {
        DashboardStatsDTO stats = incidentService.getTechnicianStats(technicianId);
        return ResponseEntity.ok(stats);
    }
}
