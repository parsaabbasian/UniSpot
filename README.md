# 📍 UniSpot | Real-Time Campus Intelligence

![UniSpot Banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge&logo=render&logoColor=white) 
![Tech Stack](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)

**UniSpot** is a high-performance, real-time event discovery platform specifically designed for York U students. It enables a "Live Map" experience where users can discover and post events that are happening around campus *right now*.

## ✨ Core Features

- **🚀 Real-Time Event Sync:** Instant updates across all devices via WebSockets.
- **🛡️ GPS Verification:** Users must be physically within York U boundaries to post events, ensuring 100% authenticity.
- **⏳ Dynamic Countdown:** Live, second-by-second countdown timers for every event.
- **🗺️ Immersive Map:** Custom Mapbox integration with clustering and satellite views.
- **🛠️ Tech-First UI:** Premium glassmorphism design with a dark-mode first aesthetic.

---

## 🛠️ Technical Architecture

### **Frontend**
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (Modern Glassmorphism)
- **Maps:** Mapbox GL JS + React Map GL
- **Icons:** Lucide React

### **Backend**
- **Language:** Go (Golang)
- **Web Framework:** Gin Gonic
- **Database:** PostgreSQL with **PostGIS** for geospatial queries.
- **Real-Time:** Gorilla WebSockets + PG Notify

---

## 📦 Setup & Installation

### 1. Prerequisites
- [Go](https://go.dev/) 1.25+
- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) with PostGIS extension.

### 2. Backend Setup
```bash
cd backend
# Create a .env file based on .env.example
go mod tidy
go run cmd/api/main.go
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment Logic

### **Environment Variables**
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL connection string (Supabase/Render). |
| `VITE_API_URL` | Backend API URL. |
| `VITE_MAPBOX_TOKEN` | Public token for Mapbox. |

---

## 🎖️ Credits
Developed with a focus on **Visual Excellence** and **Campus Community**.

---

*Verified for York University Students.*
