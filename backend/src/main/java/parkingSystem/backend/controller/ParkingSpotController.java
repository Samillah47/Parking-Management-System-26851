package parkingSystem.backend.controller;

import jakarta.validation.Valid;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.service.ParkingSpotService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parking-spots")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ParkingSpotController {

    @Autowired
    private ParkingSpotService parkingSpotService;

    @GetMapping
    public ResponseEntity<Page<ParkingSpot>> getAllSpots(Pageable pageable) {
        return ResponseEntity.ok(parkingSpotService.getAllSpots(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingSpot> getSpotById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSpotService.getSpotById(id));
    }

    @GetMapping("/available")
    public ResponseEntity<Page<ParkingSpot>> getAvailableSpots(Pageable pageable) {
        return ResponseEntity.ok(parkingSpotService.getAvailableSpots(pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<ParkingSpot>> getSpotsByStatus(@PathVariable String status, Pageable pageable) {
        return ResponseEntity.ok(parkingSpotService.getSpotsByStatus(status, pageable));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Page<ParkingSpot>> getSpotsByType(@PathVariable String type, Pageable pageable) {
        return ResponseEntity.ok(parkingSpotService.getSpotsByType(type, pageable));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<ParkingSpot>> getMyFavorites() {
        return ResponseEntity.ok(parkingSpotService.getMyFavoriteSpots());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSpot> createSpot(@Valid @RequestBody ParkingSpot spot) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parkingSpotService.createSpot(spot));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSpot> updateSpot(@PathVariable Long id, @Valid @RequestBody ParkingSpot spotDetails) {
        return ResponseEntity.ok(parkingSpotService.updateSpot(id, spotDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSpot(@PathVariable Long id) {
        parkingSpotService.deleteSpot(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{spotId}/favorites")
    public ResponseEntity<Map<String, String>> addFavorite(@PathVariable Long spotId) {
        parkingSpotService.addFavoriteSpot(spotId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Added to favorites");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{spotId}/favorites")
    public ResponseEntity<Map<String, String>> removeFavorite(@PathVariable Long spotId) {
        parkingSpotService.removeFavoriteSpot(spotId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Removed from favorites");
        return ResponseEntity.ok(response);
    }
}
