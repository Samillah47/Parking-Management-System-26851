package parkingSystem.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import parkingSystem.backend.exception.AccessDeniedException;
import parkingSystem.backend.exception.ResourceNotFoundException;
import parkingSystem.backend.model.*;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.repository.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;


@Service
@Transactional
public class ParkingReservationService {

    @Autowired
    private ParkingReservationRepository reservationRepository;

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public Page<ParkingReservation> getAllReservations(Pageable pageable) {
        return reservationRepository.findAll(pageable);
    }

    public ParkingReservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    public ParkingReservation createReservation(Long vehicleId, Long spotId, LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        User currentUser = getCurrentUser();
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (!vehicle.getOwner().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("This vehicle does not belong to you");
        }

        ParkingSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found"));

        // Check for overlapping reservations
        List<ParkingReservation> overlapping = reservationRepository.findOverlappingReservations(spot, startTime, endTime);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Spot is already reserved for this time period");
        }

        if (!"AVAILABLE".equals(spot.getStatus())) {
            throw new IllegalArgumentException("Spot is not available");
        }

        // Calculate charges
        long hours = Math.max(1, Duration.between(startTime, endTime).toHours());
        BigDecimal totalAmount = spot.getHourlyRate().multiply(BigDecimal.valueOf(hours));

        ParkingReservation reservation = new ParkingReservation();
        reservation.setUser(currentUser);
        reservation.setVehicle(vehicle);
        reservation.setParkingSpot(spot);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus("ACTIVE");
        reservation.setTotalAmount(totalAmount);

        ParkingReservation savedReservation = reservationRepository.save(reservation);

        // Update spot status
        spot.setStatus("RESERVED");
        spotRepository.save(spot);

        return savedReservation;
    }

    public ParkingReservation cancelReservation(Long id) {
        ParkingReservation reservation = getReservationById(id);
        User currentUser = getCurrentUser();

        if (!reservation.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("You can only cancel your own reservations");
        }

        if (!"ACTIVE".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Only active reservations can be cancelled");
        }

        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);

        // Free the spot
        ParkingSpot spot = reservation.getParkingSpot();
        spot.setStatus("AVAILABLE");
        spotRepository.save(spot);

        return reservation;
    }

    public Page<ParkingReservation> getMyReservations(Pageable pageable) {
        User currentUser = getCurrentUser();
        return reservationRepository.findByUser(currentUser, pageable);
    }

    public List<ParkingReservation> getMyUpcomingReservations() {
        User currentUser = getCurrentUser();
        return reservationRepository.findUpcomingByUser(currentUser);
    }

    public List<ParkingReservation> getReservationsByStatus(String status) {
        return reservationRepository.findByStatus(status);
    }

    public List<ParkingReservation> getReservationsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reservationRepository.findByUser_UserId(userId);
    }

    public BigDecimal calculateCurrentCost(Long reservationId) {
        ParkingReservation reservation = getReservationById(reservationId);
        
        if (!"ACTIVE".equals(reservation.getStatus())) {
            return reservation.getTotalAmount() != null ? reservation.getTotalAmount() : BigDecimal.ZERO;
        }

        LocalDateTime start = reservation.getStartTime();
        LocalDateTime now = LocalDateTime.now();
        
        long minutes = Duration.between(start, now).toMinutes();
        double hours = Math.max(1, Math.ceil(minutes / 60.0));
        
        BigDecimal hourlyRate = reservation.getParkingSpot().getHourlyRate();
        return hourlyRate.multiply(BigDecimal.valueOf(hours));
    }
}
