package parkingSystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import parkingSystem.backend.model.Location;
import parkingSystem.backend.service.LocationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/provinces")
    public ResponseEntity<List<Location>> getProvinces() {
        return ResponseEntity.ok(locationService.getProvinces());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<Location>> getChildren(@PathVariable Long parentId) {
        return ResponseEntity.ok(locationService.getChildren(parentId));
    }

    @GetMapping("/{locationId}/hierarchy")
    public ResponseEntity<?> getHierarchy(@PathVariable Long locationId) {
        return ResponseEntity.ok(locationService.getHierarchy(locationId));
    }

    @PostMapping("/create-hierarchy")
    public ResponseEntity<Location> createLocationHierarchy(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(locationService.createLocationHierarchy(
            request.get("province"),
            request.get("district"),
            request.get("sector"),
            request.get("cell"),
            request.get("village")
        ));
    }
}
