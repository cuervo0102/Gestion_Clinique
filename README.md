# Gestion Clinique

A full-stack clinic management web application that centralizes the daily
operations of a medical clinic: patients, appointments, and staff access.

## Overview

Gestion Clinique replaces paper-based and scattered record keeping with a
single secure platform. The REST API handles business logic and data
persistence, while a React single-page application provides the interface
for clinic staff.

## Features

-  Secure authentication with JWT and bcrypt-hashed passwords
-  Role-based access control (e.g. admin, doctor, receptionist) 
-  Patient record management (create, read, update, delete)
-  Appointment scheduling and tracking 
-  Relational data model managed through Sequelize migrations

## Tech Stack

| Layer     | Technologies                                   |
|-----------|------------------------------------------------|
| Frontend  | React, React Router                            |
| Backend   | Node.js, Express , Sequelize ORM             |
| Database  | PostgreSQL                                     |
| Auth      | JSON Web Tokens (jsonwebtoken), bcrypt         |
| Tooling   | nodemon, sequelize-cli, cors, body-parser      |

## Project Structure

    Gestion_Clinique/
    ├── backend/    # REST API, models, migrations, auth
    ├── frontend/   # React application
    ├── steps       # Setup commands used to bootstrap the project
    └── README.md

## Getting Started

### Prerequisites
- Node.js (v18+) and npm
- PostgreSQL

### Backend
    cd backend
    npm install
    # configure your database credentials (.env or config)
    npx sequelize-cli db:migrate
    npm run dev

### Frontend
    cd frontend
    npm install
    npm start

## Author

Siham — [GitHub](https://github.com/cuervo0102)
