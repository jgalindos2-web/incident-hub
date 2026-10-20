package com.incidenthub.repository;

import com.incidenthub.model.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA Repository for Incident Comments.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}
