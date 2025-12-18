package parkingSystem.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "parking_spots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long spotId;

    @Column(unique = true, nullable = false, length = 20)
    private String spotNumber;

    @Column(nullable = false, length = 20)
    private String spotType; // REGULAR, HANDICAPPED, VIP

    @Column(nullable = false, length = 20)
    private String status; // AVAILABLE, OCCUPIED, RESERVED

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(length = 100)
    private String locationDetails;

    private LocalDateTime occupiedSince;

    @JsonIgnore
    @OneToMany(mappedBy = "parkingSpot", cascade = CascadeType.ALL)
    private Set<ParkingReservation> reservations;

    @JsonIgnore
    @ManyToMany(mappedBy = "favoriteSpots")
    private Set<User> favoritedByUsers;
}