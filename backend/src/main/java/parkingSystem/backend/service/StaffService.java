package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import parkingSystem.backend.dto.ExitProcessingDTO;
import parkingSystem.backend.dto.StaffDashboardDTO;
import parkingSystem.backend.exception.ResourceNotFoundException;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.Vehicle;
import parkingSystem.backend.repository.ParkingReservationRepository;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.VehicleRepository;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;

@Service
@Transactional
public class StaffService {

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private ParkingReservationRepository reservationRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ProfileService profileService;

    public StaffDashboardDTO getStaffDashboard() {
        StaffDashboardDTO dashboard = new StaffDashboardDTO();
        
        Long totalSpots = spotRepository.count();
        Long availableSpots = spotRepository.countByStatus("AVAILABLE");
        Long occupiedSpots = spotRepository.countByStatus("OCCUPIED");
        Long reservedSpots = spotRepository.countByStatus("RESERVED");

        dashboard.setTotalSpots(totalSpots);
        dashboard.setAvailableSpots(availableSpots);
        dashboard.setOccupiedSpots(occupiedSpots);
        dashboard.setReservedSpots(reservedSpots);

        if (totalSpots > 0) {
            Double occupancyRate = ((double) (occupiedSpots + reservedSpots) / totalSpots) * 100;
            dashboard.setOccupancyRate(occupancyRate);
        }

        return dashboard;
    }

    public void quickParkVehicle(String licensePlate) {
        ParkingSpot availableSpot = spotRepository.findFirstByStatus("AVAILABLE")
                .orElseThrow(() -> new RuntimeException("No available parking spots"));

        Vehicle vehicle = vehicleRepository.findAll()
                .stream()
                .filter(v -> v.getLicensePlate().equals(licensePlate))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        ParkingReservation reservation = new ParkingReservation();
        reservation.setVehicle(vehicle);
        reservation.setUser(vehicle.getOwner());
        reservation.setParkingSpot(availableSpot);
        reservation.setStartTime(LocalDateTime.now());
        reservation.setStatus("ACTIVE");

        reservationRepository.save(reservation);

        availableSpot.setStatus("OCCUPIED");
        availableSpot.setOccupiedSince(LocalDateTime.now());
        spotRepository.save(availableSpot);
    }

    public ExitProcessingDTO processExit(Long spotId) {
        ParkingSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        ParkingReservation reservation = reservationRepository.findActiveBySpot(spot)
                .orElseThrow(() -> new RuntimeException("No active reservation for this spot"));

        LocalDateTime entryTime = reservation.getStartTime();
        LocalDateTime exitTime = LocalDateTime.now();
        
        long durationMinutes = Duration.between(entryTime, exitTime).toMinutes();
        long hours = Math.max(1, (durationMinutes + 59) / 60); // Round up

        BigDecimal totalCharge = spot.getHourlyRate().multiply(BigDecimal.valueOf(hours));

        reservation.setEndTime(exitTime);
        reservation.setStatus("COMPLETED");
        reservation.setTotalAmount(totalCharge);
        reservationRepository.save(reservation);

        spot.setStatus("AVAILABLE");
        spot.setOccupiedSince(null);
        spotRepository.save(spot);

        ExitProcessingDTO result = new ExitProcessingDTO();
        result.setSpotNumber(spot.getSpotNumber());
        result.setTotalCharge(totalCharge);
        result.setDurationMinutes(durationMinutes);
        result.setMessage("Vehicle exit processed successfully");

        return result;
    }

    public Page<ParkingReservation> getPendingPayments(Pageable pageable) {
        return reservationRepository.findByStatusIn(
                Arrays.asList("ACTIVE", "COMPLETED"), pageable);
    }

    public Object getStaffProfile() {
        return profileService.getCurrentUserProfile();
    }

    public Object updateStaffProfile(java.util.Map<String, Object> profileData) {
        return profileService.updateAdminProfile(profileData);
    }

// @Transactional
// public ExitProcessingDTO processExit(Long spotId) {
//     ParkingSpot spot = spotRepository.findById(spotId)
//             .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

//     ParkingReservation reservation = reservationRepository.findActiveBySpot(spot)
//             .orElseThrow(() -> new RuntimeException("No active reservation"));

//     // Calculate charges
//     LocalDateTime exitTime = LocalDateTime.now();
//     long minutes = Duration.between(reservation.getStartTime(), exitTime).toMinutes();
//     long hours = Math.max(1, (minutes + 59) / 60);
//     BigDecimal totalCharge = spot.getHourlyRate().multiply(BigDecimal.valueOf(hours));

//     // Update reservation
//     reservation.setEndTime(exitTime);
//     reservation.setStatus("COMPLETED");
//     reservation.setTotalAmount(totalCharge);
//     reservationRepository.save(reservation);

//     // Auto-update spot to AVAILABLE
//     spot.setStatus("AVAILABLE");
//     spot.setOccupiedSince(null);
//     spotRepository.save(spot);

//     return new ExitProcessingDTO(
//             spot.getSpotNumber(),
//             totalCharge,
//             minutes,
//             "Exit processed successfully"
//     );
// }
}
