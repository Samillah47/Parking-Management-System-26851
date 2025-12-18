package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import parkingSystem.backend.dto.ReservationRequestDTO;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;
import parkingSystem.backend.model.Vehicle;
import parkingSystem.backend.repository.ParkingReservationRepository;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.VehicleRepository;
import parkingSystem.backend.service.UserService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserReservationController {

    @Autowired
    private UserService userService;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @Autowired
    private ParkingReservationRepository reservationRepository;

    /**
     * Get all reservations for the current user
     */
    @GetMapping("/reservations")
    public ResponseEntity<List<ParkingReservation>> getUserReservations() {
        try {
            User user = userService.getCurrentUser();
            List<ParkingReservation> reservations = reservationRepository.findByUser(user);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Create a new reservation
     */
    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequestDTO request) {
        try {
            User user = userService.getCurrentUser();

            // Validate vehicle belongs to user
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            if (!vehicle.getOwner().getUserId().equals(user.getUserId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Vehicle does not belong to you");
                return ResponseEntity.status(403).body(error);
            }
            
            // Validate spot is available
            ParkingSpot spot = parkingSpotRepository.findById(request.getSpotId())
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
            
            if (!"AVAILABLE".equals(spot.getStatus())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Parking spot is not available");
                return ResponseEntity.status(400).body(error);
            }
            
            // Create reservation
            ParkingReservation reservation = new ParkingReservation();
            reservation.setUser(user);
            reservation.setVehicle(vehicle);
            reservation.setParkingSpot(spot);
            reservation.setStartTime(LocalDateTime.now());
            reservation.setStatus("ACTIVE");
            
            reservation = reservationRepository.save(reservation);
            
            // Update spot status
            spot.setStatus("RESERVED");
            parkingSpotRepository.save(spot);
            
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Cancel a reservation
     */
    @DeleteMapping("/reservations/{reservationId}")
    public ResponseEntity<Map<String, String>> cancelReservation(@PathVariable Long reservationId) {
        try {
            User user = userService.getCurrentUser();
            
            ParkingReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
            
            // Verify reservation belongs to user
            if (!reservation.getUser().getUserId().equals(user.getUserId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }
            
            // Update status
            reservation.setStatus("CANCELLED");
            reservation.setEndTime(LocalDateTime.now());
            reservationRepository.save(reservation);
            
            // Free up the spot
            ParkingSpot spot = reservation.getParkingSpot();
            spot.setStatus("AVAILABLE");
            parkingSpotRepository.save(spot);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reservation cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get active reservations for the current user
     */
    @GetMapping("/reservations/active")
    public ResponseEntity<List<ParkingReservation>> getActiveReservations() {
        try {
            User user = userService.getCurrentUser();
            List<ParkingReservation> reservations = reservationRepository.findByUserAndStatus(user, "ACTIVE");
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
