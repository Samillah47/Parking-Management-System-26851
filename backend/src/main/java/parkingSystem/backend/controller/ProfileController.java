package parkingSystem.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import parkingSystem.backend.model.Profile;
import parkingSystem.backend.service.ProfileService;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // Get profile by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<Profile> getProfileByUserId(@PathVariable Long userId) {
        return new ResponseEntity<>(
                profileService.getProfileByUserId(userId),
                HttpStatus.OK
        );
    }

    // Create or update profile
    @PutMapping("/user/{userId}")
    public ResponseEntity<Profile> createOrUpdateProfile(
            @PathVariable Long userId,
            @RequestBody Profile profileDetails) {
        return new ResponseEntity<>(
                profileService.createOrUpdateProfile(userId, profileDetails),
                HttpStatus.OK
        );
    }

    // Delete profile
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long userId) {
        profileService.deleteProfile(userId);
        return ResponseEntity.noContent().build();
    }
}
