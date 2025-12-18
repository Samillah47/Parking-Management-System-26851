package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
    private Long profileId;
    private String fullName;
    private String gender;
    private String dateOfBirth;
    private String customLocation;
}
