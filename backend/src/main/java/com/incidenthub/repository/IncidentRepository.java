package com.incidenthub.repository;

import com.incidenthub.model.Category;
import com.incidenthub.model.Incident;
import com.incidenthub.model.Priority;
import com.incidenthub.model.Status;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA Repository for Incident with advanced filters and aggregation metrics.
 */
@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // Aqui se realizo task #4: Consulta SQL/JPQL con LEFT JOIN entre incidents y app_users para obtener el nombre del técnico asignado (full_name)
    @Query("SELECT i FROM Incident i LEFT JOIN i.assignedTechnician u WHERE "
            + "(:status IS NULL OR i.status = :status) AND "
            + "(:priority IS NULL OR i.priority = :priority) AND "
            + "(:category IS NULL OR i.category = :category) AND "
            + "(:technicianId IS NULL OR (i.assignedTechnician IS NOT NULL AND i.assignedTechnician.id = :technicianId)) "
            + "ORDER BY i.createdAt DESC")
    List<Incident> findWithFilters(
            @Param("status") Status status,
            @Param("priority") Priority priority,
            @Param("category") Category category,
            @Param("technicianId") Long technicianId
    );

    long countByStatus(Status status);

    long countByPriority(Priority priority);

    long countByCategory(Category category);

    @Query("SELECT i.category, COUNT(i) FROM Incident i GROUP BY i.category")
    List<Object[]> countGroupedByCategory();

    @Query("SELECT COALESCE(i.assignedTechnician.fullName, 'Sin Asignar'), COUNT(i) "
            + "FROM Incident i GROUP BY i.assignedTechnician.fullName")
    List<Object[]> countGroupedByTechnician();
}
