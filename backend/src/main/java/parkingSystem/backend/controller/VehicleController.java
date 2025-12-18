package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import parkingSystem.backend.model.User;
import parkingSystem.backend.model.Vehicle;
import parkingSystem.backend.repository.VehicleRepository;
import parkingSystem.backend.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class VehicleController {

    @Autowired
    private UserService userService;

    @Autowired
    private VehicleRepository vehicleRepository;

    /**
     * Get all vehicles for the current user
     */
    @GetMapping("/users/vehicles")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Vehicle>> getUserVehicles() {
        try {
            User user = userService.getCurrentUser();
            List<Vehicle> vehicles = vehicleRepository.findByOwner(user);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/vehicles/owner/{ownerId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByOwner(@PathVariable Long ownerId) {
        try {
            User owner = userService.getUserById(ownerId);
            List<Vehicle> vehicles = vehicleRepository.findByOwner(owner);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Add a new vehicle for the current user
     */
    @PostMapping("/users/vehicles")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addVehicle(@RequestBody Vehicle vehicle) {
        try {
            User user = userService.getCurrentUser();
            
            // Check if license plate already exists for this user
            List<Vehicle> existingVehicles = vehicleRepository.findByOwner(user);
            boolean licensePlateExists = existingVehicles.stream()
                .anyMatch(v -> v.getLicensePlate().equalsIgnoreCase(vehicle.getLicensePlate()));
            
            if (licensePlateExists) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Vehicle with this license plate already exists");
                return ResponseEntity.status(400).body(error);
            }
            
            // Set the owner
            vehicle.setOwner(user);
            
            // Save vehicle
            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            
            return ResponseEntity.ok(savedVehicle);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add vehicle: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Update a vehicle
     */
    @PutMapping("/users/vehicles/{vehicleId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long vehicleId,
            @RequestBody Vehicle updatedVehicle) {
        try {
            User user = userService.getCurrentUser();
            
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            // Verify ownership
            if (!vehicle.getOwner().getUserId().equals(user.getUserId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }
            
            // Update fields
            vehicle.setLicensePlate(updatedVehicle.getLicensePlate());
            vehicle.setVehicleType(updatedVehicle.getVehicleType());
            vehicle.setBrand(updatedVehicle.getBrand());
            vehicle.setModel(updatedVehicle.getModel());
            vehicle.setColor(updatedVehicle.getColor());
            
            Vehicle saved = vehicleRepository.save(vehicle);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Delete a vehicle
     */
    @DeleteMapping("/users/vehicles/{vehicleId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long vehicleId) {
        try {
            User user = userService.getCurrentUser();
            
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            // Verify ownership
            if (!vehicle.getOwner().getUserId().equals(user.getUserId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }
            
            vehicleRepository.delete(vehicle);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Vehicle deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get a specific vehicle by ID
     */
    @GetMapping("/users/vehicles/{vehicleId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getVehicle(@PathVariable Long vehicleId) {
        try {
            User user = userService.getCurrentUser();
            
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            // Verify ownership
            if (!vehicle.getOwner().getUserId().equals(user.getUserId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }
            
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Search user's vehicles by license plate
     */
    @GetMapping("/users/vehicles/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Vehicle>> searchVehicles(@RequestParam("q") String query) {
        try {
            User user = userService.getCurrentUser();
            
            // Get all user's vehicles and filter by license plate
            List<Vehicle> vehicles = vehicleRepository.findByOwner(user);
            List<Vehicle> filteredVehicles = vehicles.stream()
                .filter(v -> v.getLicensePlate().toLowerCase().contains(query.toLowerCase()))
                .limit(10)
                .toList();
            
            return ResponseEntity.ok(filteredVehicles);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}