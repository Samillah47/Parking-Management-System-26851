package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    private Long totalUsers;
    private Long totalStaff;
    private Long totalReservations;
    private Long activeReservations;
    private Long totalSpots;
    private Long availableSpots;
    private Long occupiedSpots;
    private Long reservedSpots;
    private Double occupancyRate;
    private BigDecimal todayRevenue;
    private BigDecimal weeklyRevenue;
    private BigDecimal monthlyRevenue;
    private List<HourlyStats> hourlyOccupancy;
    private List<LocationStats> locationStats;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class HourlyStats {
    private String hour;
    private Long occupied;
    private Double rate;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class LocationStats {
    private String location;
    private Long spots;
    private Long occupied;
}
