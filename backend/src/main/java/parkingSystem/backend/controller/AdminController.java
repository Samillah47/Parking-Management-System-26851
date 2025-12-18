package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import parkingSystem.backend.dto.AdminDashboardDTO;
import parkingSystem.backend.dto.AdminSearchResultDTO;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;
import parkingSystem.backend.model.enums.Role;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.UserRepository;
import parkingSystem.backend.service.AdminService;
import parkingSystem.backend.service.UserService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getAdminDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> changeUserRole(
            @PathVariable Long userId,
            @RequestParam Role role) {
        userService.changeUserRole(userId, role);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User role updated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<Page<User>> getUsersByRole(
            @PathVariable Role role,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getUsersByRole(role, pageable));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ============================================
    // PARKING SPOTS MANAGEMENT
    // ============================================

    @GetMapping("/spots/pageable")
    public ResponseEntity<Page<ParkingSpot>> getAllSpotsPaginated(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        if (status != null && !status.equals("ALL")) {
            return ResponseEntity.ok(parkingSpotRepository.findByStatus(status, pageable));
        }
        return ResponseEntity.ok(parkingSpotRepository.findAll(pageable));
    }

    @PostMapping("/spots")
    public ResponseEntity<ParkingSpot> createParkingSpot(@RequestBody ParkingSpot spot) {
        return ResponseEntity.ok(adminService.createParkingSpot(spot));
    }

    // ============================================
    // REVENUE SUMMARY - FIXED!
    // ============================================

    @GetMapping("/revenue/summary")
    public ResponseEntity<Map<String, BigDecimal>> getRevenueSummary() {
        // Call the public method that returns all revenue data
        Map<String, BigDecimal> revenue = adminService.getRevenueSummary();
        return ResponseEntity.ok(revenue);
    }

    // ============================================
    // GLOBAL SEARCH - FIXED!
    // ============================================

    @GetMapping("/search/global")
    public ResponseEntity<AdminSearchResultDTO> globalSearch(@RequestParam("q") String query) {
        AdminSearchResultDTO results = adminService.globalSearch(query);
        return ResponseEntity.ok(results);
    }

    // ============================================
    // USER SEARCH
    // ============================================

    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam("q") String query) {
        List<User> users = userRepository
                .findTop10ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile() {
        return ResponseEntity.ok(adminService.getAdminProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody Map<String, Object> profileData) {
        return ResponseEntity.ok(adminService.updateAdminProfile(profileData));
    }

    @PutMapping("/location")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Long> request) {
        return ResponseEntity.ok(userService.updateUserLocation(request.get("locationId")));
    }

    // @GetMapping("/spots/pageable")
    // public ResponseEntity<Page<ParkingSpot>> getAllSpotsPaginated(
    //         @RequestParam(required = false) String status,
    //         @RequestParam(defaultValue = "0") int page,
    //         @RequestParam(defaultValue = "10") int size) {
        
    //     Pageable pageable = PageRequest.of(page, size);
        
    //     if (status != null && !status.equals("ALL")) {
    //         return ResponseEntity.ok(parkingSpotRepository.findByStatus(status, pageable));
    //     }
    //     return ResponseEntity.ok(parkingSpotRepository.findAll(pageable));
    // }
}