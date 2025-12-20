package parkingSystem.backend.service;

import parkingSystem.backend.dto.UserDashboardDTO;
import parkingSystem.backend.dto.UserSearchResultDTO;
import parkingSystem.backend.exception.AccessDeniedException;
import parkingSystem.backend.exception.ResourceNotFoundException;
import parkingSystem.backend.model.Location;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;
import parkingSystem.backend.model.Vehicle;
import parkingSystem.backend.model.enums.Role;
import parkingSystem.backend.repository.LocationRepository;
import parkingSystem.backend.repository.ParkingReservationRepository;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.ProfileRepository;
import parkingSystem.backend.repository.UserRepository;
import parkingSystem.backend.repository.VehicleRepository;
import parkingSystem.backend.dto.SignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ParkingReservationRepository reservationRepository;

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User getUserById(Long id) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.getUserId().equals(id) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new AccessDeniedException("You are not authorized to view this user");
        }

        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User createUserFromSignup(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setPhone(signUpRequest.getPhone());

        // Convert string to enum: "ADMIN" | "STAFF" | "USER"
        Role role;
        try {
            role = Role.valueOf(signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + signUpRequest.getRole());
        }
        user.setRole(role);
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public void sendOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        System.out.println("OTP for " + email + ": " + otp);
        emailService.sendOtpEmail(email, otp);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getOtp().equals(otp) || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    public UserDashboardDTO getUserDashboard() {
        User user = getCurrentUser();
        
        UserDashboardDTO dashboard = new UserDashboardDTO();
        dashboard.setYourReservations((long) user.getReservations().size());
        dashboard.setYourVehicles((long) user.getVehicles().size());
        dashboard.setFavoriteSpots((long) user.getFavoriteSpots().size());

        return dashboard;
    }

    public Page<User> getUsersByRole(Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

    public void changeUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);
    }

    // ============================================
    // FAVORITE SPOTS MANAGEMENT
    // ============================================

    @Transactional
    public void addFavoriteSpot(Long spotId) {
        ParkingSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        User user = getCurrentUser();
        
        if (!user.getFavoriteSpots().contains(spot)) {
            user.getFavoriteSpots().add(spot);
            userRepository.save(user);
        }
    }

    @Transactional
    public void removeFavoriteSpot(Long spotId) {
        ParkingSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        User user = getCurrentUser();
        
        if (user.getFavoriteSpots().contains(spot)) {
            user.getFavoriteSpots().remove(spot);
            userRepository.save(user);
        }
    }

    public List<ParkingSpot> getFavoriteSpots() {
        User user = getCurrentUser();
        return new ArrayList<>(user.getFavoriteSpots());
    }

    // ============================================
    // PARK VEHICLE (RESERVE SPOT)
    // ============================================

    @Transactional
    public ParkingReservation parkVehicle(Long vehicleId, Long spotId) {
        User user = getCurrentUser();
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
                
        if (!vehicle.getOwner().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("Not your vehicle");
        }

        ParkingSpot spot = spotRepository.findById(spotId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
                
        if (!"AVAILABLE".equals(spot.getStatus())) {
            throw new IllegalArgumentException("Spot not available");
        }

        // Create reservation
        ParkingReservation reservation = new ParkingReservation();
        reservation.setUser(user);
        reservation.setVehicle(vehicle);
        reservation.setParkingSpot(spot);
        reservation.setStartTime(LocalDateTime.now());
        reservation.setStatus("ACTIVE");
        reservation.setTotalAmount(spot.getHourlyRate());
        
        // Update spot status
        spot.setStatus("OCCUPIED");
        spot.setOccupiedSince(LocalDateTime.now());
        spotRepository.save(spot);
        
        return reservationRepository.save(reservation);
    }

    // ============================================
    // UNPAID RESERVATIONS
    // ============================================

    public List<ParkingReservation> getUnpaidReservations() {
        User user = getCurrentUser();
        
        // Get all reservations for current user that are ACTIVE or COMPLETED
        // These are considered "unpaid" or "pending payment"
        return reservationRepository.findAll()
                .stream()
                .filter(r -> r.getUser().getUserId().equals(user.getUserId()))
                .filter(r -> "ACTIVE".equals(r.getStatus()) || "COMPLETED".equals(r.getStatus()))
                .collect(Collectors.toList());
    }

    // ============================================
    // USER SEARCH (for search functionality)
    // ============================================

    @Transactional
    public Map<String, Object> updateUserLocation(Long locationId) {
        User user = getCurrentUser();
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));
        
        user.setLocation(location);
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Location updated successfully");
        return response;
    }

    public UserSearchResultDTO searchUserData(String query) {
        User user = getCurrentUser();
        UserSearchResultDTO result = new UserSearchResultDTO();
        
        // Search own vehicles by license plate
        result.setVehicles(
            vehicleRepository.findTop10ByOwnerAndLicensePlateContainingIgnoreCase(user, query)
        );
        
        // Search own reservations by spot number
        result.setReservations(
            reservationRepository.findTop10ByUserAndSpotNumberLike(user, query)
        );
        
        // Search favorite spots
        result.setFavoriteSpots(
            user.getFavoriteSpots().stream()
                .filter(spot -> spot.getSpotNumber().toLowerCase().contains(query.toLowerCase()))
                .limit(10)
                .collect(Collectors.toList())
        );
        
        return result;
    }

    


}