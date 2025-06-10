# Car Rental React Application

A full-stack car rental web application built with React (frontend) and Node.js/Express + MongoDB (backend). Supports two roles:

- **Admin**: Manage cars (CRUD), view all reservations.  
- **User**: Browse available cars, make reservations, view your active reservations.

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Prerequisites](#prerequisites)  
4. [Setup & Installation](#setup--installation)  
   - [Clone Repository](#clone-repository)  
   - [Backend Configuration](#backend-configuration)  
   - [Frontend Configuration](#frontend-configuration)  
5. [Environment Variables](#environment-variables)  
6. [Running the Application](#running-the-application)  
   - [Start MongoDB](#start-mongodb)  
   - [Start Backend](#start-backend)  
   - [Start Frontend](#start-frontend)  
7. [Usage](#usage)  
   - [Admin](#admin)  
   - [User](#user)  
8. [API Endpoints](#api-endpoints)  
   - [Authentication](#authentication)  
   - [Cars](#cars)  
   - [Reservations](#reservations)  
9. [Roles & Permissions](#roles--permissions)

---

## Features

- **Authentication**: Register & Login with JWT stored in `localStorage`.  
- **Admin Dashboard**:
  - Create, Read, Update, Delete cars.
  - View all user reservations.
- **User Dashboard**:
  - Browse only available cars.
  - Create a reservation (days count-down).
  - View your active reservations with live “days/hours/minutes” remaining.
- **Responsive UI**: Interactive tables with sorting, hover states.
- **Form Validation**: Client- and server-side rules for usernames (3–20 chars) and passwords (min 6 chars).
- **Protected Routes**: Only authenticated users can access car list & reservations; only admins can manage cars.

---

## Tech Stack

- **Frontend**  
  - React (v19.1.0) with Hooks (`useState`, `useEffect`)  
  - React Router v6 for navigation  
  - Axios for HTTP requests  
  - CSS modules via `App.css` for styling

- **Backend**  
  - Node.js + Express  
  - MongoDB via Mongoose  
  - JSON Web Tokens for auth  
  - bcrypt for password hashing  
  - CORS enabled for `http://localhost:3000`

---

## Prerequisites

- **Node.js** v16+ and npm (installed globally)  
- **MongoDB** (local service or Docker)  

---

## Setup & Installation

### Clone Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### Backend Configuration

1. **Install dependencies**:
   ```bash
   npm init -y
   npm install express mongoose body-parser cors bcrypt jsonwebtoken dotenv
   ```
2. **Create backend env file(if needed)** at project root named `.env.server`:
   ```env
   MONGO_URI=mongodb://localhost:27017/car_rental_db
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

### Frontend Configuration

1. **Install React dependencies**:
   ```bash
   npm install
   npm install react-router-dom axios
   ```
2. **Create(if needed)** a `.env` in the root (for CRA):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

---

## Environment Variables

- **`.env.server`** (backend)
  - `MONGO_URI` – MongoDB connection string  
  - `JWT_SECRET` – secret key for JWT  
  - `PORT` – backend port (e.g. 5000)

- **`.env`** (frontend)
  - `REACT_APP_API_URL` – e.g. `http://localhost:5000/api`

---

## Running the Application

### Start MongoDB

**Local Windows Service**  
```powershell
net start MongoDB
```

**Or via Docker**  
```bash
docker run -d --name mongodb -p 27017:27017 -v mongo_data:/data/db mongo:latest
```

### Start Backend

```bash
node rest-server-cars.js
```

### Start Frontend

```bash
npm start
```

---

## Usage

### Admin

1. **Login** with  
   ```
   Username: Admin  
   Password: 123456
   ```
2. Manage cars via **Cars** page.  
3. View all reservations via **Reservations** page.

### User

1. **Register** at `/register`.  
2. **Login**.  
3. Browse and reserve cars via **Cars** page.  
4. View your active reservations via **Reservations** page.

---

## API Endpoints

### Authentication

| Method | Endpoint            | Body                               | Returns                              | Access  |
|--------|---------------------|------------------------------------|--------------------------------------|---------|
| POST   | `/api/auth/register`| `{ username, password }`           | `{ message }`                        | Public  |
| POST   | `/api/auth/login`   | `{ username, password }`           | `{ token, role, userId }`            | Public  |

### Cars

| Method | Endpoint            | Body                                          | Returns               | Access        |
|--------|---------------------|-----------------------------------------------|-----------------------|---------------|
| GET    | `/api/cars`         | —                                             | `[{ Car }]`           | Authenticated |
| GET    | `/api/cars/:id`     | —                                             | `{ Car }`             | Authenticated |
| POST   | `/api/cars`         | `{ brand, model, year, pricePerDay, reserved }` | `{ Car }`             | Admin         |
| PUT    | `/api/cars/:id`     | `{ brand, model, year, pricePerDay, reserved }` | `{ Car }`             | Admin         |
| DELETE | `/api/cars/:id`     | —                                             | 204 No Content        | Admin         |

### Reservations

| Method | Endpoint                        | Body                          | Returns                       | Access               |
|--------|---------------------------------|-------------------------------|-------------------------------|----------------------|
| GET    | `/api/reservations/user/:userId`| —                             | `[{ Reservation }]`           | Authenticated (owner)|
| GET    | `/api/reservations/all`         | —                             | `[{ Reservation }]`           | Admin                |
| POST   | `/api/reservations`             | `{ userId, carId, days }`     | `{ Reservation }`             | Authenticated        |

---

## Roles & Permissions

- **Admin**  
  - Full CRUD on cars  
  - View all reservations  
- **User**  
  - Browse available cars  
  - Create reservations  
  - View only active reservations  

---
