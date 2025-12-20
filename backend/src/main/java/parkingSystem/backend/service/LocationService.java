package parkingSystem.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import parkingSystem.backend.dto.LocationDTO;
import parkingSystem.backend.model.Location;
import parkingSystem.backend.model.enums.LocationType;
import parkingSystem.backend.repository.LocationRepository;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Transactional(readOnly = true)
    public List<LocationDTO> getLocationHierarchy() {
        try {
            List<Location> provinces = locationRepository.findByType(LocationType.PROVINCE);
            if (provinces == null || provinces.isEmpty()) {
                return new ArrayList<>();
            }
            
            List<LocationDTO> result = new ArrayList<>();
            for (Location province : provinces) {
                try {
                    result.add(convertToDTO(province));
                } catch (Exception e) {
                    System.err.println("Error converting province: " + province.getName() + " - " + e.getMessage());
                }
            }
            return result;
        } catch (Exception e) {
            System.err.println("Error in getLocationHierarchy: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private LocationDTO convertToDTO(Location location) {
        try {
            LocationDTO dto = new LocationDTO();
            dto.setLocationId(location.getLocationId());
            dto.setName(location.getName());
            dto.setType(location.getType());
            dto.setParentId(location.getParent() != null ? location.getParent().getLocationId() : null);
            
            List<LocationDTO> childrenDTOs = new ArrayList<>();
            try {
                if (location.getChildren() != null && !location.getChildren().isEmpty()) {
                    for (Location child : new ArrayList<>(location.getChildren())) {
                        try {
                            childrenDTOs.add(convertToDTO(child));
                        } catch (Exception e) {
                            System.err.println("Error converting child: " + e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error accessing children: " + e.getMessage());
            }
            dto.setChildren(childrenDTOs);
            
            return dto;
        } catch (Exception e) {
            System.err.println("Error in convertToDTO: " + e.getMessage());
            throw e;
        }
    }

    public List<Location> getProvinces() {
        return locationRepository.findByType(LocationType.PROVINCE);
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public List<Location> getChildren(Long parentId) {
        Location parent = locationRepository.findById(parentId).orElseThrow();
        return locationRepository.findByParent(parent);
    }

    public Map<String, Object> getHierarchy(Long locationId) {
        Location location = locationRepository.findById(locationId).orElseThrow();
        
        Map<String, Object> hierarchy = new HashMap<>();
        List<String> pathNames = new ArrayList<>();
        
        Location current = location;
        while (current != null) {
            pathNames.add(0, current.getName());
            hierarchy.put(current.getType().name().toLowerCase(), current);
            current = current.getParent();
        }
        
        hierarchy.put("fullPath", String.join(" > ", pathNames));
        return hierarchy;
    }

    @Transactional
    public Location createLocationHierarchy(String provinceName, String districtName, String sectorName, String cellName, String villageName) {
        Location province = locationRepository.findByNameIgnoreCaseAndType(provinceName, LocationType.PROVINCE)
            .orElseGet(() -> locationRepository.save(new Location(provinceName, LocationType.PROVINCE)));
        
        if (districtName == null || districtName.isEmpty()) return province;
        
        Location district = locationRepository.findByParent(province).stream()
            .filter(l -> l.getName().equalsIgnoreCase(districtName))
            .findFirst()
            .orElseGet(() -> {
                Location d = new Location(districtName, LocationType.DISTRICT);
                d.setParent(province);
                return locationRepository.save(d);
            });
        
        if (sectorName == null || sectorName.isEmpty()) return district;
        
        Location sector = locationRepository.findByParent(district).stream()
            .filter(l -> l.getName().equalsIgnoreCase(sectorName))
            .findFirst()
            .orElseGet(() -> {
                Location s = new Location(sectorName, LocationType.SECTOR);
                s.setParent(district);
                return locationRepository.save(s);
            });
        
        if (cellName == null || cellName.isEmpty()) return sector;
        
        Location cell = locationRepository.findByParent(sector).stream()
            .filter(l -> l.getName().equalsIgnoreCase(cellName))
            .findFirst()
            .orElseGet(() -> {
                Location c = new Location(cellName, LocationType.CELL);
                c.setParent(sector);
                return locationRepository.save(c);
            });
        
        if (villageName == null || villageName.isEmpty()) return cell;
        
        Location village = locationRepository.findByParent(cell).stream()
            .filter(l -> l.getName().equalsIgnoreCase(villageName))
            .findFirst()
            .orElseGet(() -> {
                Location v = new Location(villageName, LocationType.VILLAGE);
                v.setParent(cell);
                return locationRepository.save(v);
            });
        
        return village;
    }

    public void deleteLocation(Long locationId) {
        Location location = locationRepository.findById(locationId)
            .orElseThrow(() -> new RuntimeException("Location not found"));
        locationRepository.delete(location);
    }

    public Location updateLocation(Long locationId, String newName) {
        Location location = locationRepository.findById(locationId)
            .orElseThrow(() -> new RuntimeException("Location not found"));
        location.setName(newName);
        return locationRepository.save(location);
    }
}
