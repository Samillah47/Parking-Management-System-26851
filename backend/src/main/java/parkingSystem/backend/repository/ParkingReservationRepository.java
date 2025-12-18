package parkingSystem.backend.repository;

import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingReservationRepository extends JpaRepository<ParkingReservation, Long> {
    List<ParkingReservation> findByStatus(String status);
    Page<ParkingReservation> findByUser(User user, Pageable pageable);
    long countByStatus(String status);
    
    @Query("SELECT r FROM ParkingReservation r WHERE r.user = :user AND r.startTime > CURRENT_TIMESTAMP ORDER BY r.startTime ASC")
    List<ParkingReservation> findUpcomingByUser(@Param("user") User user);
    
    @Query("SELECT r FROM ParkingReservation r WHERE r.parkingSpot = :spot AND r.status = 'ACTIVE' ")
    Optional<ParkingReservation> findActiveBySpot(@Param("spot") ParkingSpot spot);
    
    @Query("SELECT r FROM ParkingReservation r WHERE r.parkingSpot = :spot AND r.status IN ('ACTIVE', 'RESERVED') AND (r.startTime < :endTime AND r.endTime > :startTime)")
    List<ParkingReservation> findOverlappingReservations(
        @Param("spot") ParkingSpot spot,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT r FROM ParkingReservation r WHERE r.status = 'COMPLETED' AND r.endTime BETWEEN :startDate AND :endDate")
    List<ParkingReservation> findCompletedBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    // List<ParkingReservation> findReservationsByUserAndDateRange(Object object, LocalDateTime startDate,
    //         LocalDateTime endDate);
    Optional<User> findByStatusAndEndTimeBetween(String string, LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query("SELECT r FROM ParkingReservation r WHERE r.user = :user AND r.startTime BETWEEN :startDate AND :endDate")
    List<ParkingReservation> findReservationsByUserAndDateRange(
        @Param("user") User user,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("""
           SELECT r FROM ParkingReservation r
           WHERE r.user = :user
             AND LOWER(r.parkingSpot.spotNumber) LIKE LOWER(CONCAT('%', :spotNumberPart, '%'))
           ORDER BY r.startTime DESC
           """)
    List<ParkingReservation> findTop10ByUserAndSpotNumberLike(
            @Param("user") User user,
            @Param("spotNumberPart") String spotNumberPart
    );

    @Query("SELECT r FROM ParkingReservation r WHERE r.user = :user AND r.status IN :statuses")
    List<ParkingReservation> findByUserAndStatusIn(
        @Param("user") User user, 
        @Param("statuses") List<String> statuses
    );

    Page<ParkingReservation> findByStatusIn(List<String> statuses, Pageable pageable);

    // Find all reservations for a user
    List<ParkingReservation> findByUser(User user);
    
    // Find reservations by user and status
    List<ParkingReservation> findByUserAndStatus(User user, String status);
    
    // Find reservations by user ID
    List<ParkingReservation> findByUser_UserId(Long userId);

}