package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import parkingSystem.backend.dto.ExitProcessingDTO;
import parkingSystem.backend.dto.StaffDashboardDTO;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.service.StaffService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/staff")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StaffController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<StaffDashboardDTO> getDashboard() {
        return ResponseEntity.ok(staffService.getStaffDashboard());
    }

    @PostMapping("/park")
    public ResponseEntity<Map<String, String>> parkVehicle(@RequestBody Map<String, String> request) {
        String licensePlate = request.get("licensePlate");
        staffService.quickParkVehicle(licensePlate);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Vehicle parked successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/exit/{spotId}")
    public ResponseEntity<ExitProcessingDTO> processExit(@PathVariable Long spotId) {
        return ResponseEntity.ok(staffService.processExit(spotId));
    }

    // ============================================
    // SEARCH SPOTS - FIXED!
    // ============================================

    /**
     * Search parking spots by spot number
     * GET /staff/spots/search?q=A01
     */
    @GetMapping("/spots/search")
    public ResponseEntity<List<ParkingSpot>> searchSpots(@RequestParam("q") String query) {
        List<ParkingSpot> spots = parkingSpotRepository
                .findTop10BySpotNumberContainingIgnoreCase(query);
        return ResponseEntity.ok(spots);
    }

    /**
     * Alternative: Search with more details (spot number OR location)
     * GET /staff/spots/search-all?q=ground
     */
    @GetMapping("/spots/search-all")
    public ResponseEntity<List<ParkingSpot>> searchAllSpots(@RequestParam("q") String query) {
        List<ParkingSpot> spots = parkingSpotRepository.searchSpots(query);
        return ResponseEntity.ok(spots);
    }

    @GetMapping("/spots")
    public ResponseEntity<org.springframework.data.domain.Page<ParkingSpot>> getAllSpots(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(parkingSpotRepository.findAll(pageable));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getStaffProfile() {
        return ResponseEntity.ok(staffService.getStaffProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateStaffProfile(@RequestBody Map<String, Object> profileData) {
        return ResponseEntity.ok(staffService.updateStaffProfile(profileData));
    }

    @Autowired
    private parkingSystem.backend.service.UserService userService;

    @PutMapping("/location")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Long> request) {
        return ResponseEntity.ok(userService.updateUserLocation(request.get("locationId")));
    }
}