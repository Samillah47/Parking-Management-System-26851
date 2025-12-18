package parkingSystem.backend.repository;

import parkingSystem.backend.model.User;
import parkingSystem.backend.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByLicensePlate(String licensePlate);
    List<Vehicle> findByOwner(User owner);
    Page<Vehicle> findByVehicleType(String vehicleType, Pageable pageable);
    
    @Query("SELECT v FROM Vehicle v WHERE v.owner = :owner AND LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :plate, '%'))")
    List<Vehicle> findByOwnerAndPartialPlate(@Param("owner") User owner, @Param("plate") String plate);

    List<Vehicle> findTop10ByOwnerAndLicensePlateContainingIgnoreCase(
            User owner,
            String licensePlatePart
    );
}
