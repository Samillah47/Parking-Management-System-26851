package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDashboardDTO {
    private Long assignedLotId;
    private String lotName;
    private Long totalSpots;
    private Long availableSpots;
    private Long occupiedSpots;
    private Long reservedSpots;
    private Double occupancyRate;
    private List<QuickAction> quickActions;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class QuickAction {
    private String action;
    private Long count;
}