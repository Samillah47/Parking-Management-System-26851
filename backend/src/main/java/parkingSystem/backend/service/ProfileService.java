package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import parkingSystem.backend.dto.ProfileDTO;
import parkingSystem.backend.exception.ResourceNotFoundException;
import parkingSystem.backend.model.Profile;
import parkingSystem.backend.model.User;
import parkingSystem.backend.repository.ProfileRepository;
import parkingSystem.backend.repository.UserRepository;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Helper method to get current user
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    // Get profile by user ID (for admin access)
    public Profile getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return user.getProfile();
    }

    // Create or update profile by user ID (for admin access)
    @Transactional
    public Profile createOrUpdateProfile(Long userId, Profile profileDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // If profile exists, update it, otherwise create new one
        Profile profile;
        if (user.getProfile() != null) {
            profile = user.getProfile();
            profile.setFullName(profileDetails.getFullName());
            profile.setGender(profileDetails.getGender());
            profile.setDateOfBirth(profileDetails.getDateOfBirth());
        } else {
            profile = profileDetails;
            profile.setUser(user);
        }

        return profileRepository.save(profile);
    }

    // Delete profile by user ID
    @Transactional
    public void deleteProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        if (user.getProfile() != null) {
            profileRepository.delete(user.getProfile());
        }
    }

    // ============================================
    // CURRENT USER PROFILE METHODS (New!)
    // ============================================

    // Get current user's profile
    public ProfileDTO getCurrentUserProfile() {
        User user = getCurrentUser();
        
        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
            profile = profileRepository.save(profile);
        }
        
        ProfileDTO dto = new ProfileDTO();
        dto.setProfileId(profile.getProfileId());
        dto.setFullName(profile.getFullName());
        dto.setGender(profile.getGender());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setCustomLocation(user.getLocation() != null ? user.getLocation().getName() : null);
        return dto;
    }

    // Update current user's profile
    @Transactional
    public Profile updateCurrentUserProfile(Profile profileDetails) {
        User user = getCurrentUser();
        Profile profile = user.getProfile();
        
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
        }
        
        profile.setFullName(profileDetails.getFullName());
        profile.setGender(profileDetails.getGender());
        profile.setDateOfBirth(profileDetails.getDateOfBirth());
        
        return profileRepository.save(profile);
    }

    // Delete current user's profile
    @Transactional
    public void deleteCurrentUserProfile() {
        User user = getCurrentUser();
        
        if (user.getProfile() != null) {
            profileRepository.delete(user.getProfile());
        }
    }

    public ProfileDTO getAdminProfile() {
        return getCurrentUserProfile();
    }

    @Transactional
    public Profile updateAdminProfile(java.util.Map<String, Object> profileData) {
        Profile profile = new Profile();
        profile.setFullName((String) profileData.get("fullName"));
        profile.setGender((String) profileData.get("gender"));
        profile.setDateOfBirth((String) profileData.get("dateOfBirth"));
        return updateCurrentUserProfile(profile);
    }
}