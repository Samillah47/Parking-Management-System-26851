package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import parkingSystem.backend.dto.RevenueReportDTO;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.repository.ParkingReservationRepository;
import parkingSystem.backend.repository.ParkingSpotRepository;
import parkingSystem.backend.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ParkingReservationRepository reservationRepository;

    @Autowired
    private ParkingSpotRepository spotRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Generate revenue report for a date range
     */
    public RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Get all reservations in the date range (not just completed)
        List<ParkingReservation> allReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStartTime().isAfter(startDateTime) && r.getStartTime().isBefore(endDateTime))
                .collect(Collectors.toList());

        // Calculate total revenue (including active reservations)
        BigDecimal totalRevenue = allReservations.stream()
                .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group by date for daily revenue
        Map<String, BigDecimal> dailyRevenue = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (ParkingReservation reservation : allReservations) {
            if (reservation.getTotalAmount() != null) {
                String date = reservation.getStartTime().toLocalDate().format(formatter);
                dailyRevenue.merge(date, reservation.getTotalAmount(), BigDecimal::add);
            }
        }

        // Count reservations by status
        Map<String, Long> reservationsByStatus = allReservations.stream()
                .collect(Collectors.groupingBy(
                        ParkingReservation::getStatus,
                        Collectors.counting()
                ));

        RevenueReportDTO report = new RevenueReportDTO();
        report.setTotalRevenue(totalRevenue);
        report.setDailyRevenue(dailyRevenue);
        report.setReservationsByStatus(reservationsByStatus);
        report.setTotalReservations((long) allReservations.size());

        return report;
    }

    /**
     * Generate PDF report (simplified version - returns CSV-like data as bytes)
     * For real PDF generation, you would use libraries like iText or Apache PDFBox
     */
    public byte[] generatePDFReport(String reportType, LocalDate startDate, LocalDate endDate) {
        RevenueReportDTO report = getRevenueReport(startDate, endDate);

        // Create a simple text report (in real implementation, use PDF library)
        StringBuilder content = new StringBuilder();
        content.append("PARKING SYSTEM REPORT\n");
        content.append("======================\n\n");
        content.append("Report Type: ").append(reportType).append("\n");
        content.append("Period: ").append(startDate).append(" to ").append(endDate).append("\n\n");
        content.append("REVENUE SUMMARY\n");
        content.append("---------------\n");
        content.append("Total Revenue: RWF ").append(report.getTotalRevenue()).append("\n");
        content.append("Total Reservations: ").append(report.getTotalReservations()).append("\n\n");
        
        content.append("DAILY REVENUE\n");
        content.append("-------------\n");
        report.getDailyRevenue().forEach((date, amount) -> 
            content.append(date).append(": RWF ").append(amount).append("\n")
        );

        content.append("\nRESERVATIONS BY STATUS\n");
        content.append("----------------------\n");
        report.getReservationsByStatus().forEach((status, count) ->
            content.append(status).append(": ").append(count).append("\n")
        );

        content.append("\n\nGenerated: ").append(LocalDateTime.now()).append("\n");

        return content.toString().getBytes();
    }

    /**
     * Get quick statistics for dashboard
     */
    public Map<String, Object> getQuickStats() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusMonths(1);

        // Today's stats
        List<ParkingReservation> todayReservations = reservationRepository
                .findCompletedBetween(startOfDay, now);
        BigDecimal todayRevenue = todayReservations.stream()
                .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Week's stats
        List<ParkingReservation> weekReservations = reservationRepository
                .findCompletedBetween(startOfWeek, now);
        BigDecimal weekRevenue = weekReservations.stream()
                .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Month's stats
        List<ParkingReservation> monthReservations = reservationRepository
                .findCompletedBetween(startOfMonth, now);
        BigDecimal monthRevenue = monthReservations.stream()
                .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("todayRevenue", todayRevenue);
        stats.put("todayReservations", todayReservations.size());
        stats.put("weekRevenue", weekRevenue);
        stats.put("weekReservations", weekReservations.size());
        stats.put("monthRevenue", monthRevenue);
        stats.put("monthReservations", monthReservations.size());
        
        stats.put("totalSpots", spotRepository.count());
        stats.put("availableSpots", spotRepository.countByStatus("AVAILABLE"));
        stats.put("occupiedSpots", spotRepository.countByStatus("OCCUPIED"));
        stats.put("totalUsers", userRepository.count());

        return stats;
    }
}
