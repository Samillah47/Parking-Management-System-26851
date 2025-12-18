# ParkShere - Parking Management System

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A comprehensive parking management system built with Spring Boot and React, designed to streamline parking operations for users, staff, and administrators.

## 🚀 Features

### User Features
- **Spot Booking**: Real-time parking slot reservation and immediate parking
- **Vehicle Management**: Register and manage multiple vehicles
- **Favorites**: Save frequently used parking spots
- **Reservation History**: Track past and upcoming reservations
- **Payment Integration**: Automated billing based on hourly rates

### Staff Features
- **Spot Assignment**: Manually assign parking spots to vehicles
- **Exit Processing**: Handle vehicle exits and payment processing
- **Real-time Dashboard**: Monitor parking lot occupancy and revenue

### Admin Features
- **User Management**: Comprehensive user administration
- **Spot Management**: Add, edit, and manage parking spots
- **Revenue Reports**: Detailed analytics and financial reporting
- **System Configuration**: Manage locations and system settings

## 🛠️ Tech Stack

### Backend
- **Java 21** - Programming language
- **Spring Boot 3.5.6** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence
- **PostgreSQL** - Primary database
- **JWT** - Token-based authentication
- **Maven** - Dependency management

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library

## 📋 Prerequisites

- Java 21 or higher
- Node.js 18+ and npm
- PostgreSQL 12+
- Maven 3.8+

## 🚀 Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/Samillah47/Parking-Management-System-26851.git
cd Parking-Management-System-26851
```

### 2. Database Configuration
Create a PostgreSQL database and update `backend/src/main/resources/application.properties`:

```properties
spring.application.name=Parking Management System
spring.datasource.url=jdbc:postgresql://localhost:5432/parking_management_db
spring.datasource.username=postgres
spring.datasource.password=......

# Suppress static resource warnings
spring.web.resources.add-mappings=false


# Hibernate settings (optional but common)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT CONFIGURATION
jwt.secret=3f9a871bc44d891e72aa5c917df40a0b4f8c32d2e55bc1a8e66d992ff3ccdeaa7b2c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
jwt.expiration=86400000  

#mail
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=parkshererw@gmail.com
spring.mail.password=vgdbzcuolecvwulk
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

```

### 3. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend will run on `http://localhost:8080`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration
- `POST /auth/verify-2fa` - Two-factor authentication

### Parking Management
- `GET /users/spots/available` - Get available parking spots
- `POST /users/park` - Park vehicle immediately
- `POST /reservations/users/reservations` - Create reservation
- `GET /reservations/my-reservations` - Get user reservations
- `PUT /reservations/{id}/cancel` - Cancel reservation

### Vehicle Management
- `GET /users/vehicles` - Get user vehicles
- `POST /users/vehicles` - Add new vehicle
- `PUT /users/vehicles/{id}` - Update vehicle
- `DELETE /users/vehicles/{id}` - Delete vehicle

### Admin Operations
- `GET /admin/dashboard` - Admin dashboard data
- `GET /admin/users` - Manage users
- `POST /admin/spots` - Add parking spots
- `GET /admin/reports/revenue` - Revenue reports

## 📊 System Architecture

### Activity Diagram
User parking slot booking workflow

<img width="752" height="1163" alt="Activity Diagram - Parking Spot Reservation" src="https://github.com/user-attachments/assets/de53e968-9926-4aa9-9034-47b082a98697" />

### Data Flow
System data flow between components
<img width="1761" height="941" alt="Data Flow (Level 1)" src="https://github.com/user-attachments/assets/6510b9b9-297f-4a53-86b0-05d529a0e361" />

### Sequence Diagram
Reserve parking slot interaction sequence
<img width="1664" height="1024" alt="Sequence Diagram - Reserve Parking Spot" src="https://github.com/user-attachments/assets/4f8f8fe2-555b-40d0-8986-7022c6e3cc23" />

## Entity Relationship Diagram
Database schema and relationships
<img width="1822" height="806" alt="Entity Relationship Diagram (ERD)" src="https://github.com/user-attachments/assets/a8908a2a-6396-481a-87dc-6e4414b6ddb0" />


## 🏗️ Project Structure

```
ParkShere/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   │   └── parkingSystem/backend/
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── repository/  # Data access layer
│   │       ├── model/       # Entity classes
│   │       ├── dto/         # Data transfer objects
│   │       ├── config/      # Configuration classes
│   │       └── security/    # Security components
│   └── src/main/resources/
│       └── application.properties
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.tsx
│   └── package.json
├── diagrams/               # UML diagrams
└── README.md
```

## 🔐 Default Credentials

### Test User Account
- **Username**: `test`
- **Password**: `Test123`

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **My Name** - [Samillah Mutoni](https://github.com/Samillah47)

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- React team for the robust frontend framework
- University supervisors for project guidance

---

**Note**: This is an academic project developed for educational purposes.
