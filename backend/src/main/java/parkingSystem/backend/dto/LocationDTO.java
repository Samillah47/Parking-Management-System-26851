package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import parkingSystem.backend.model.enums.LocationType;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private Long locationId;
    private String name;
    private LocationType type;
    private Long parentId;
    private List<LocationDTO> children;
}
