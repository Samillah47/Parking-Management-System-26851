package parkingSystem.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import parkingSystem.backend.model.User;
import parkingSystem.backend.model.enums.Role;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    long countByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);
    List<User> findTop10ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String usernamePart,
            String emailPart
    );
    
}
