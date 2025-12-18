package parkingSystem.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import parkingSystem.backend.model.Profile;



@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    
    
}
