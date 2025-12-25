# FleetPulse - Fleet Management System

## Project Overview

**FleetPulse** is a full-stack web application designed for comprehensive fleet vehicle management. The platform enables users to track, manage, and analyze their vehicle fleet with detailed logging capabilities for fuel consumption, maintenance records, insurance policies, and odometer readings. Built with modern web technologies, the application features secure authentication, real-time data analytics, and an intuitive user interface.

## Key Features

- **Vehicle Management**: Complete CRUD operations for fleet vehicles with detailed information tracking (fuel type, registration, transmission, etc.)
- **Fuel Logging**: Track fuel consumption, costs, and odometer readings with automatic mileage calculations
- **Maintenance Tracking**: Record maintenance history with date and odometer-based reminder system
- **Insurance Management**: Manage insurance policies with renewal tracking and automated reminders
- **Analytics Dashboard**: Comprehensive log summaries with fuel efficiency calculations, cost analysis, and date-range filtering
- **Smart Reminders**: Configurable reminder system for maintenance and insurance renewals (date-based or odometer-based)
- **User Authentication**: Secure JWT-based authentication with refresh token mechanism and HTTP-only cookies
- **Search & Filter**: Advanced vehicle search with favorite vehicle functionality
- **Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS

## Technical Stack

### Frontend
- **React 19** with functional components and hooks
- **Vite 7** for build tooling and development server
- **React Router DOM v6** for client-side routing with protected routes
- **Tailwind CSS 3** for responsive, utility-first styling
- **LocalStorage API** for client-side data persistence

### Backend
- **Node.js** with ES modules
- **Express.js 4** RESTful API architecture
- **MongoDB** with **Mongoose 8** for data modeling and persistence
- **JWT (JSON Web Tokens)** for secure authentication
- **bcryptjs** for password hashing
- **Cookie-parser** for secure HTTP-only refresh token storage

### Security & Performance
- HTTPS implementation for secure development environment
- CORS configuration for cross-origin resource sharing
- Token refresh mechanism for seamless user experience
- Protected route middleware for authorization
- Input validation and error handling throughout

## Technical Achievements

- Implemented dual-token authentication system (access tokens + refresh tokens) for enhanced security
- Developed automated fuel mileage calculator with cost-per-kilometer analysis
- Built hybrid data storage architecture (MongoDB for persistent data, localStorage for client-side logs)
- Created reusable component library for consistent UI/UX across the application
- Implemented data migration utility for seamless protocol transitions (HTTP to HTTPS)
- Designed responsive grid layouts with advanced search and filtering capabilities
- Developed reminder system with dual trigger mechanisms (date-based and odometer-based)

## Architecture Highlights

- **Separation of Concerns**: Clear distinction between frontend presentation and backend business logic
- **RESTful API Design**: Standardized endpoints for vehicle and authentication operations
- **Component-Based Architecture**: Modular React components for maintainability and reusability
- **State Management**: React hooks for efficient local state management
- **Error Handling**: Comprehensive error handling with user-friendly feedback
- **Code Organization**: Well-structured file hierarchy with utilities, components, pages, and routes

## Project Structure

```
fleetpulse/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route-based page components
│   ├── utils/          # Helper functions and utilities
│   └── App.jsx         # Main application component
└── server/
    ├── controllers/    # Business logic handlers
    ├── models/         # MongoDB schemas
    ├── routes/         # API route definitions
    └── middleware/     # Authentication middleware
```

---

**Note**: This project demonstrates proficiency in modern full-stack development, including RESTful API design, secure authentication implementation, database modeling, and responsive UI development.

