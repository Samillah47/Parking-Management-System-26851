

package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import parkingSystem.backend.dto.UserDashboardDTO;
import parkingSystem.backend.dto.UserSearchResultDTO;
import parkingSystem.backend.exception.ResourceNotFoundException;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.dto.ProfileDTO;
import parkingSystem.backend.model.Profile;
import parkingSystem.backend.model.User;
import parkingSystem.backend.model.Vehicle;
import parkingSystem.backend.repository.ParkingReservationRepository;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.UserRepository;
import parkingSystem.backend.repository.VehicleRepository;
import parkingSystem.backend.service.ProfileService;
import parkingSystem.backend.service.UserService;
import parkingSystem.backend.service.VehicleService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ParkingReservationRepository reservationRepository;
    
    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboardDTO> getDashboard() {
        return ResponseEntity.ok(userService.getUserDashboard());
    }

    // @GetMapping("/vehicles")
    // public ResponseEntity<List<Vehicle>> getMyVehicles() {
    //     return ResponseEntity.ok(vehicleService.getMyVehicles());
    // }

    // ============================================
    // PROFILE ENDPOINTS (NEW!)
    // ============================================

    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getMyProfile() {
        return ResponseEntity.ok(profileService.getCurrentUserProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<Profile> updateMyProfile(@RequestBody Profile profile) {
        return ResponseEntity.ok(profileService.updateCurrentUserProfile(profile));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Map<String, String>> deleteMyProfile() {
        profileService.deleteCurrentUserProfile();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/location")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Long> request) {
        return ResponseEntity.ok(userService.updateUserLocation(request.get("locationId")));
    }

    // ============================================
    // FAVORITE SPOTS ENDPOINTS (NEW!)
    // ============================================

    @GetMapping("/spots/favorites")
    public ResponseEntity<List<ParkingSpot>> getFavoriteSpots() {
        return ResponseEntity.ok(userService.getFavoriteSpots());
    }

    @PostMapping("/spots/{spotId}/favorite")
    public ResponseEntity<Map<String, String>> addFavoriteSpot(@PathVariable Long spotId) {
        userService.addFavoriteSpot(spotId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Added to favorites");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/spots/{spotId}/favorite")
    public ResponseEntity<Map<String, String>> removeFavoriteSpot(@PathVariable Long spotId) {
        userService.removeFavoriteSpot(spotId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Removed from favorites");
        return ResponseEntity.ok(response);
    }

    // ============================================
    // PARK VEHICLE ENDPOINT (NEW!)
    // ============================================

    @PostMapping("/park")
    public ResponseEntity<ParkingReservation> parkVehicle(
            @RequestParam Long vehicleId,
            @RequestParam Long spotId) {
        return ResponseEntity.ok(userService.parkVehicle(vehicleId, spotId));
    }

    // ============================================
    // PENDING PAYMENTS ENDPOINT (NEW!)
    // ============================================

    @GetMapping("/pending-payments")
    public ResponseEntity<List<ParkingReservation>> getUnpaidReservations() {
        return ResponseEntity.ok(userService.getUnpaidReservations());
    }

    // ============================================
    // SEARCH ENDPOINTS
    // ============================================

    @GetMapping("/{userId}/reservations/search")
    public ResponseEntity<List<ParkingReservation>> searchUserReservations(
            @PathVariable Long userId,
            @RequestParam("q") String query) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<ParkingReservation> reservations =
                reservationRepository.findTop10ByUserAndSpotNumberLike(user, query);

        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{userId}/vehicles/search")
    public ResponseEntity<List<Vehicle>> searchUserVehicles(
            @PathVariable Long userId,
            @RequestParam("q") String query) {

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Vehicle> vehicles =
                vehicleRepository.findTop10ByOwnerAndLicensePlateContainingIgnoreCase(owner, query);

        return ResponseEntity.ok(vehicles);
    }

    // @GetMapping("/search")
    // public ResponseEntity<UserSearchResultDTO> searchMyData(@RequestParam("q") String query) {
    //     return ResponseEntity.ok(userService.searchUserData(query));
    // }

    @GetMapping("/spots/available")
    public ResponseEntity<List<ParkingSpot>> getAvailableSpots() {
        List<ParkingSpot> spots = parkingSpotRepository.findAll();
        return ResponseEntity.ok(spots);
    }

    @GetMapping("/search")
    public ResponseEntity<UserSearchResultDTO> searchUserData(@RequestParam("q") String query) {
        try {
            // UserService.searchUserData() gets current user internally
            // So we only pass the query string
            UserSearchResultDTO results = userService.searchUserData(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}