package parkingSystem.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import parkingSystem.backend.model.ParkingReservation;
import parkingSystem.backend.model.ParkingSpot;
import parkingSystem.backend.model.Vehicle;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResultDTO {
    private List<Vehicle> vehicles;
    private List<ParkingReservation> reservations;
    private List<ParkingSpot> favoriteSpots;
}
