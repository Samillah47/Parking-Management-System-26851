package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardDTO {
    private Long yourReservations;
    private Long yourVehicles;
    private Long favoriteSpots;
    private List<ReservationSummary> upcomingReservations;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class ReservationSummary {
    private Long reservationId;
    private String spotNumber;
    private String startTime;
    private String endTime;
    private String status;
}
