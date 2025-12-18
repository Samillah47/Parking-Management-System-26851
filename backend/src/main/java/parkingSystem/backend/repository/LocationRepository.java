package parkingSystem.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import parkingSystem.backend.model.Location;
import parkingSystem.backend.model.enums.LocationType;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByParentIsNull();
    List<Location> findByParent(Location parent);
    Optional<Location> findByNameIgnoreCaseAndType(String name, LocationType type);
    
    @Query("SELECT l FROM Location l WHERE l.type = :type")
    List<Location> findByType(@Param("type") LocationType type);
}
