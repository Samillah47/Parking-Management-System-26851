package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.User;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSearchResultDTO {
    private List<User> users;
    private List<ParkingSpot> spots;
    private List<ParkingReservation> reservations;
}