package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import parkingSystem.backend.dto.AdminDashboardDTO;
import parkingSystem.backend.dto.AdminSearchResultDTO;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.enums.Role;
import parkingSystem.backend.repository.ParkingReservationRepository;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminService {

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private ParkingReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    public AdminDashboardDTO getAdminDashboard() {
        AdminDashboardDTO dashboard = new AdminDashboardDTO();

        // Spot metrics
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

        // Reservation metrics
        Long totalReservations = reservationRepository.count();
        Long activeReservations = reservationRepository.countByStatus("ACTIVE");

        dashboard.setTotalReservations(totalReservations);
        dashboard.setActiveReservations(activeReservations);

        // Revenue
        dashboard.setTodayRevenue(calculateTodayRevenue());
        dashboard.setWeeklyRevenue(calculateWeeklyRevenue());
        dashboard.setMonthlyRevenue(calculateMonthlyRevenue());

        // User metrics
        dashboard.setTotalUsers(userRepository.countByRole(Role.USER));
        dashboard.setTotalStaff(userRepository.countByRole(Role.STAFF));

        return dashboard;
    }

    // ============================================
    // REVENUE CALCULATION METHODS (Private)
    // ============================================

    private BigDecimal calculateTodayRevenue() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();
        
        return reservationRepository.findCompletedBetween(startOfDay, endOfDay)
                .stream()
                .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateWeeklyRevenue() {
        LocalDateTime startOfWeek = LocalDate.now().minusDays(7).atStartOfDay();
        LocalDateTime endOfWeek = LocalDate.now().plusDays(1).atStartOfDay();
        
        return reservationRepository.findCompletedBetween(startOfWeek, endOfWeek)
                .stream()
                .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateMonthlyRevenue() {
        LocalDateTime startOfMonth = LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().plusDays(1).atStartOfDay();
        
        return reservationRepository.findCompletedBetween(startOfMonth, endOfMonth)
                .stream()
                .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ============================================
    // PUBLIC METHOD: Get Revenue Summary
    // This is what the controller should call!
    // ============================================

    public Map<String, BigDecimal> getRevenueSummary() {
        Map<String, BigDecimal> revenue = new HashMap<>();
        revenue.put("today", calculateTodayRevenue());
        revenue.put("week", calculateWeeklyRevenue());
        revenue.put("month", calculateMonthlyRevenue());
        return revenue;
    }

    // ============================================
    // PARKING SPOT MANAGEMENT
    // ============================================

    @Transactional
    public ParkingSpot createParkingSpot(ParkingSpot spot) {
        if (spotRepository.existsBySpotNumber(spot.getSpotNumber())) {
            throw new IllegalArgumentException("Spot number already exists");
        }
        spot.setStatus("AVAILABLE");
        return spotRepository.save(spot);
    }

    // ============================================
    // GLOBAL SEARCH
    // ============================================

    public AdminSearchResultDTO globalSearch(String query) {
        AdminSearchResultDTO result = new AdminSearchResultDTO();
        
        // Search users - using the correct method name from your repository
        result.setUsers(userRepository
            .findTop10ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query));
        
        // Search spots - simple contains search
        result.setSpots(spotRepository
            .findAll()
            .stream()
            .filter(spot -> spot.getSpotNumber().toLowerCase().contains(query.toLowerCase()))
            .limit(10)
            .collect(Collectors.toList()));
        
        // Search reservations - by user or spot number
        result.setReservations(reservationRepository
            .findAll()
            .stream()
            .filter(res -> 
                res.getUser().getUsername().toLowerCase().contains(query.toLowerCase()) ||
                res.getParkingSpot().getSpotNumber().toLowerCase().contains(query.toLowerCase())
            )
            .limit(10)
            .collect(Collectors.toList()));
        
        return result;
    }

    public Object getAdminProfile() {
        return profileService.getAdminProfile();
    }

    @Transactional
    public Object updateAdminProfile(Map<String, Object> profileData) {
        return profileService.updateAdminProfile(profileData);
    }
}