package parkingSystem.backend.repository;

import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    boolean existsBySpotNumber(String spotNumber);
    long countByStatus(String status);
    Page<ParkingSpot> findByStatus(String status, Pageable pageable);
    Page<ParkingSpot> findBySpotType(String spotType, Pageable pageable);
    
    @Query("SELECT p FROM ParkingSpot p WHERE p.status = 'AVAILABLE' ORDER BY p.spotNumber ASC")
    List<ParkingSpot> findAvailableSpots();
    
    Optional<ParkingSpot> findFirstByStatus(String status);
    
    @Query("SELECT p FROM ParkingSpot p WHERE :user MEMBER OF p.favoritedByUsers")
    List<ParkingSpot> findFavoritesByUser(@Param("user") User user);

    // ============================================
    // SEARCH METHODS (NEW!)
    // ============================================

    /**
     * Search spots by spot number (case-insensitive)
     * Returns up to 10 results
     */
    List<ParkingSpot> findTop10BySpotNumberContainingIgnoreCase(String spotNumber);

    /**
     * Alternative search using custom query
     * Searches in spot number and location details
     */
    @Query("SELECT p FROM ParkingSpot p WHERE " +
           "LOWER(p.spotNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.locationDetails) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ParkingSpot> searchSpots(@Param("query") String query);

    /**
     * Search spots with pagination
     */
    @Query("SELECT p FROM ParkingSpot p WHERE " +
           "LOWER(p.spotNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<ParkingSpot> searchSpotsPaginated(@Param("query") String query, Pageable pageable);

    List<ParkingSpot> findByStatus(String status);
}