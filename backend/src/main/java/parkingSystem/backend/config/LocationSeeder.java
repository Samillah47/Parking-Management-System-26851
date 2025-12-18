package parkingSystem.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import parkingSystem.backend.model.Location;
import parkingSystem.backend.model.enums.LocationType;
import parkingSystem.backend.repository.LocationRepository;

@Component
public class LocationSeeder implements CommandLineRunner {

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public void run(String... args) {
        if (locationRepository.count() > 0) {
            System.out.println("✅ Locations already exist: " + locationRepository.count() + " locations");
            return;
        }

        // Kigali Province
        Location kigali = new Location("Kigali", LocationType.PROVINCE);
        kigali = locationRepository.save(kigali);
        
        Location gasabo = new Location("Gasabo", LocationType.DISTRICT);
        gasabo.setParent(kigali);
        gasabo = locationRepository.save(gasabo);
        
        Location kicukiro = new Location("Kicukiro", LocationType.DISTRICT);
        kicukiro.setParent(kigali);
        kicukiro = locationRepository.save(kicukiro);
        
        Location nyarugenge = new Location("Nyarugenge", LocationType.DISTRICT);
        nyarugenge.setParent(kigali);
        nyarugenge = locationRepository.save(nyarugenge);

        // Eastern Province
        Location eastern = new Location("Eastern", LocationType.PROVINCE);
        eastern = locationRepository.save(eastern);
        
        Location rwamagana = new Location("Rwamagana", LocationType.DISTRICT);
        rwamagana.setParent(eastern);
        locationRepository.save(rwamagana);
        
        Location kayonza = new Location("Kayonza", LocationType.DISTRICT);
        kayonza.setParent(eastern);
        locationRepository.save(kayonza);

        // Northern Province
        Location northern = new Location("Northern", LocationType.PROVINCE);
        northern = locationRepository.save(northern);
        
        Location musanze = new Location("Musanze", LocationType.DISTRICT);
        musanze.setParent(northern);
        locationRepository.save(musanze);
        
        Location gicumbi = new Location("Gicumbi", LocationType.DISTRICT);
        gicumbi.setParent(northern);
        locationRepository.save(gicumbi);

        // Southern Province
        Location southern = new Location("Southern", LocationType.PROVINCE);
        southern = locationRepository.save(southern);
        
        Location huye = new Location("Huye", LocationType.DISTRICT);
        huye.setParent(southern);
        locationRepository.save(huye);
        
        Location muhanga = new Location("Muhanga", LocationType.DISTRICT);
        muhanga.setParent(southern);
        locationRepository.save(muhanga);

        // Western Province
        Location western = new Location("Western", LocationType.PROVINCE);
        western = locationRepository.save(western);
        
        Location rubavu = new Location("Rubavu", LocationType.DISTRICT);
        rubavu.setParent(western);
        locationRepository.save(rubavu);
        
        Location rusizi = new Location("Rusizi", LocationType.DISTRICT);
        rusizi.setParent(western);
        locationRepository.save(rusizi);

        System.out.println("✅ Locations seeded successfully! Total: " + locationRepository.count());
    }
}
