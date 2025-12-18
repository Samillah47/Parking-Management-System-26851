package parkingSystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExitProcessingDTO {
    private String spotNumber;
    private BigDecimal totalCharge;
    private Long durationMinutes;
    private String message;
}
