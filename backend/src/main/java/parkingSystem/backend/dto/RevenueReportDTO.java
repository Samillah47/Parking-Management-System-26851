package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportDTO {
    private BigDecimal totalRevenue;
    private Map<String, BigDecimal> dailyRevenue;
    private Map<String, Long> reservationsByStatus;
    private Long totalReservations;
}
