package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import parkingSystem.backend.exception.AccessDeniedException;
import parkingSystem.backend.exception.ResourceNotFoundException;
import parkingSystem.backend.model.User;
import parkingSystem.backend.model.Vehicle;
import parkingSystem.backend.repository.UserRepository;
import parkingSystem.backend.repository.VehicleRepository;

import java.util.List;

@Service
@Transactional
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public Page<Vehicle> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new IllegalArgumentException("License plate already exists");
        }

        User currentUser = getCurrentUser();
        vehicle.setOwner(currentUser);

        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = getVehicleById(id);
        
        User currentUser = getCurrentUser();
        if (!vehicle.getOwner().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("You are not authorized to update this vehicle");
        }

        if (!vehicle.getLicensePlate().equals(vehicleDetails.getLicensePlate()) &&
            vehicleRepository.existsByLicensePlate(vehicleDetails.getLicensePlate())) {
            throw new IllegalArgumentException("License plate already exists");
        }

        vehicle.setLicensePlate(vehicleDetails.getLicensePlate());
        vehicle.setVehicleType(vehicleDetails.getVehicleType());
        vehicle.setBrand(vehicleDetails.getBrand());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setColor(vehicleDetails.getColor());

        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        
        User currentUser = getCurrentUser();
        if (!vehicle.getOwner().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("You are not authorized to delete this vehicle");
        }

        vehicleRepository.delete(vehicle);
    }

    public List<Vehicle> getMyVehicles() {
        User currentUser = getCurrentUser();
        return vehicleRepository.findByOwner(currentUser);
    }

    public Page<Vehicle> getVehiclesByType(String type, Pageable pageable) {
        return vehicleRepository.findByVehicleType(type, pageable);
    }

    public List<Vehicle> searchByLicensePlate(String plate) {
        User currentUser = getCurrentUser();
        return vehicleRepository.findByOwnerAndPartialPlate(currentUser, plate);
    }
}