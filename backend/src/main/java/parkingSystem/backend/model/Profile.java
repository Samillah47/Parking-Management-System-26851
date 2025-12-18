package parkingSystem.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @Column(length = 100)
    private String fullName;

    @Column(length = 20)
    private String gender;

    @Column(length = 20)
    private String dateOfBirth;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}