package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingLotDTO {
    private List<ParkingSlotDTO> slots;
    private Double occupancyRate;
    private Long availableCount;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class ParkingSlotDTO {
    private Long spotId;
    private String spotNumber;
    private String status;
    private String spotType;
    private String vehiclePlate;
    private String occupantName;
    private LocalDateTime occupiedSince;
}
