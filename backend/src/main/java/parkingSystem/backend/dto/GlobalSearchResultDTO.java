package parkingSystem.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchResultDTO {
    private List<User> users;
    private List<ParkingSpot> spots;
    private List<ParkingReservation> reservations;
}
