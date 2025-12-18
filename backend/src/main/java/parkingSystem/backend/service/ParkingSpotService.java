package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import parkingSystem.backend.exception.ResourceNotFoundException;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.UserRepository;

import java.util.List;

@Service
@Transactional
public class ParkingSpotService {

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public Page<ParkingSpot> getAllSpots(Pageable pageable) {
        return spotRepository.findAll(pageable);
    }

    public ParkingSpot getSpotById(Long id) {
        return spotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found"));
    }

    public ParkingSpot createSpot(ParkingSpot spot) {
        if (spotRepository.existsBySpotNumber(spot.getSpotNumber())) {
            throw new IllegalArgumentException("Spot number already exists");
        }
        return spotRepository.save(spot);
    }

    public ParkingSpot updateSpot(Long id, ParkingSpot spotDetails) {
        ParkingSpot spot = getSpotById(id);

        if (!spot.getSpotNumber().equals(spotDetails.getSpotNumber()) &&
            spotRepository.existsBySpotNumber(spotDetails.getSpotNumber())) {
            throw new IllegalArgumentException("Spot number already exists");
        }

        spot.setSpotNumber(spotDetails.getSpotNumber());
        spot.setSpotType(spotDetails.getSpotType());
        spot.setStatus(spotDetails.getStatus());
        spot.setHourlyRate(spotDetails.getHourlyRate());
        spot.setLocationDetails(spotDetails.getLocationDetails());

        return spotRepository.save(spot);
    }

    public void deleteSpot(Long id) {
        ParkingSpot spot = getSpotById(id);
        spotRepository.delete(spot);
    }

    public Page<ParkingSpot> getAvailableSpots(Pageable pageable) {
        return spotRepository.findByStatus("AVAILABLE", pageable);
    }

    public Page<ParkingSpot> getSpotsByStatus(String status, Pageable pageable) {
        return spotRepository.findByStatus(status, pageable);
    }

    public Page<ParkingSpot> getSpotsByType(String type, Pageable pageable) {
        return spotRepository.findBySpotType(type, pageable);
    }

    public void addFavoriteSpot(Long spotId) {
        ParkingSpot spot = getSpotById(spotId);
        User currentUser = getCurrentUser();

        if (!currentUser.getFavoriteSpots().contains(spot)) {
            currentUser.getFavoriteSpots().add(spot);
            userRepository.save(currentUser);
        }
    }

    public void removeFavoriteSpot(Long spotId) {
        ParkingSpot spot = getSpotById(spotId);
        User currentUser = getCurrentUser();

        if (currentUser.getFavoriteSpots().contains(spot)) {
            currentUser.getFavoriteSpots().remove(spot);
            userRepository.save(currentUser);
        }
    }

    public List<ParkingSpot> getMyFavoriteSpots() {
        User currentUser = getCurrentUser();
        return spotRepository.findFavoritesByUser(currentUser);
    }
}
