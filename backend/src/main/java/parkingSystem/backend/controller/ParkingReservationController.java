package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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
import parkingSystem.backend.service.ParkingReservationService;
import parkingSystem.backend.service.UserService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ParkingReservationController {

    @Autowired
    private ParkingReservationService reservationService;

    @Autowired
    private UserService userService;

    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private ParkingReservationRepository reservationRepository;

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;


    @GetMapping
    public ResponseEntity<Page<ParkingReservation>> getAllReservations(Pageable pageable) {
        return ResponseEntity.ok(reservationService.getAllReservations(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingReservation> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<Page<ParkingReservation>> getMyReservations(Pageable pageable) {
        return ResponseEntity.ok(reservationService.getMyReservations(pageable));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<ParkingReservation>> getUpcomingReservations() {
        return ResponseEntity.ok(reservationService.getMyUpcomingReservations());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ParkingReservation>> getReservationsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(reservationService.getReservationsByStatus(status));
    }

    @PostMapping
    public ResponseEntity<ParkingReservation> createReservation(
            @RequestParam Long vehicleId,
            @RequestParam Long spotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(vehicleId, spotId, startTime, endTime));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ParkingReservation> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ParkingReservation>> getReservationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUserId(userId));
    }

    @GetMapping("/{id}/current-cost")
    public ResponseEntity<?> getCurrentCost(@PathVariable Long id) {
        return ResponseEntity.ok(java.util.Map.of("currentCost", reservationService.calculateCurrentCost(id)));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ParkingReservation> activateReservation(@PathVariable Long id) {
        ParkingReservation reservation = reservationService.getReservationById(id);
        
        if (!"RESERVED".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Only reserved spots can be activated");
        }
        
        // Keep the reservation fee already paid
        BigDecimal reservationFee = reservation.getTotalAmount();
        
        reservation.setStatus("ACTIVE");
        reservation.setStartTime(LocalDateTime.now());
        reservation.setTotalAmount(reservationFee); // Start with reservation fee
        
        ParkingSpot spot = reservation.getParkingSpot();
        spot.setStatus("OCCUPIED");
        spot.setOccupiedSince(LocalDateTime.now());
        parkingSpotRepository.save(spot);
        
        return ResponseEntity.ok(reservationRepository.save(reservation));
    }

    @PostMapping("/users/reservations")
    public ResponseEntity<ParkingReservation> createReservation(
            @RequestBody ReservationRequestDTO request) {
        try {
            User user = userService.getCurrentUser();
            
            // Validate vehicle belongs to user
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            if (!vehicle.getOwner().getUserId().equals(user.getUserId())) {
                throw new RuntimeException("Vehicle does not belong to user");
            }
            
            // Validate spot is available
            ParkingSpot spot = parkingSpotRepository.findById(request.getSpotId())
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
            
            if (!"AVAILABLE".equals(spot.getStatus())) {
                throw new RuntimeException("Parking spot is not available");
            }
            
            // Create reservation with 1-hour reservation fee
            ParkingReservation reservation = new ParkingReservation();
            reservation.setUser(user);
            reservation.setVehicle(vehicle);
            reservation.setParkingSpot(spot);
            reservation.setStartTime(LocalDateTime.now());
            reservation.setStatus("RESERVED");
            reservation.setTotalAmount(spot.getHourlyRate()); // Reservation fee = 1 hour rate
            
            reservation = reservationRepository.save(reservation);
            
            // Update spot status
            spot.setStatus("RESERVED");
            parkingSpotRepository.save(spot);
            
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            e.printStackTrace(); // Check backend logs!
            return ResponseEntity.status(500).build();
        }
    }
}
