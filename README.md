# 📍 UniSpot | Real-Time Campus Intelligence

![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge&logo=render&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**UniSpot** is a high-performance, real-time event discovery platform designed for York University students. It delivers a live campus intelligence experience — see what's happening around you *right now*, verify it's real, and share it instantly.

> 🔴 **Live at:** [yorkunispot.vercel.app](https://yorkunispot.vercel.app)

---

## ✨ Core Features

### 🗺️ Live Map
- **Mapbox GL** powered interactive map with 3D tilt, clustering, and satellite toggle.
- Events appear as **category-colored** markers with icons.
- **Live pulsing blue dot** shows your real GPS position (Google Maps-style).
- Collapsible sidebar — the map **fully expands** to fill screen when hidden.

### ⚡ Real-Time Everything (WebSocket + Postgres NOTIFY)
| Event | How it propagates |
|-------|-------------------|
| New event posted | API → WebSocket → all browsers |
| Event verified | API → WebSocket → verified count updates live |
| Event expired/deleted | Postgres `AFTER DELETE` trigger → `pg_notify` → WebSocket → removed from map |
| **Any Supabase field change** | Postgres `AFTER UPDATE` trigger → `pg_notify` → WebSocket → **patches live on map** |

> Editing an event category, title, or time directly in Supabase will update every connected browser within ~1 second — no refresh needed.

### 🔔 Live Notification Toasts
Three types of color-coded alerts appear in the top-right corner:
- 🔵 **New Event Found** — when a marker is added
- 🟢 **Event Verified** — when someone confirms an event
- 🔴 **Event Removed** — when an event expires or is deleted

### 🛡️ IP-Based Verification
- One verification per IP per event to prevent vote manipulation.
- Backend checks for duplicate IPs using a `Verifications` table with a composite unique constraint.

### 🕐 Toronto (EST/EDT) Time Accuracy
- All `start_time` / `end_time` values are stored as `timestamptz` (UTC) in Supabase.
- Frontend parses them with a robust ISO 8601 normalizer (`parseEventDate`) that handles Supabase's space-formatted timestamps consistently across all browsers.
- Times are displayed in **local Toronto time** in 12-hour AM/PM format (e.g., `10:29 AM`).

### 🎨 Premium UI
- **Glassmorphism** cards and popups.
- **Dark mode** first with smooth light/dark toggle.
- Micro-animations: marker hover lifts, pulse rings on live events, scan-line hero, countdown timers.
- **Sidebar collapse** — fades and collapses to `w-0`; map auto-resizes via `mapRef.resize()` after the CSS transition.

---

## 🛠️ Technical Architecture

### Frontend (`/frontend`)
| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 (glassmorphism, dark mode) |
| Maps | Mapbox GL JS + react-map-gl |
| Icons | Lucide React |
| HTTP | Axios |
| Real-time | Native `WebSocket` API with auto-reconnect |

### Backend (`/backend`)
| Layer | Technology |
|-------|------------|
| Language | Go (Golang) |
| Web Framework | Gin Gonic |
| ORM | GORM |
| Database | PostgreSQL + **PostGIS** (Supabase) |
| Real-Time | Gorilla WebSockets + `pgx` LISTEN/NOTIFY |
| Geospatial | `ST_DWithin`, `ST_GeogFromText` |

### Real-Time Architecture
```
Supabase DB
  ├─ INSERT event   → API handler → ws.BroadcastEvent("new_event")
  ├─ UPDATE event   → pg_notify("event_updated", row_to_json(NEW))
  │                    └─ Go Listener → ws.BroadcastEvent("update_event")
  ├─ DELETE event   → pg_notify("event_deleted", OLD.id)
  │                    └─ Go Listener → ws.BroadcastEvent("delete_event")
  └─ Verify event   → API handler → ws.BroadcastEvent("verify_event")

WebSocket Hub (Go)
  └─ Broadcasts to all connected frontend clients

React Frontend
  └─ onmessage handler → patches events[] state in-place → re-renders map
```

---

## 📦 Setup & Installation

### Prerequisites
- [Go](https://go.dev/) 1.21+
- [Node.js](https://nodejs.org/) 18+
- PostgreSQL with PostGIS (or a [Supabase](https://supabase.com) project)
- A [Mapbox](https://mapbox.com) public token

### Backend
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL
go mod tidy
go run cmd/api/main.go
```

### Frontend
```bash
cd frontend
cp .env.example .env          # fill in VITE_API_URL and VITE_MAPBOX_TOKEN
npm install
npm run dev
```

> On first backend start, GORM auto-migrates tables and the Postgres triggers for `event_deleted` and `event_updated` are automatically registered.

---

## 🌐 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Backend `.env` | Full Supabase/Postgres connection string |
| `PORT` | Backend `.env` | Server port (default: `8081`) |
| `VITE_API_URL` | Frontend `.env` | Backend base URL |
| `VITE_MAPBOX_TOKEN` | Frontend `.env` | Mapbox public token |

---

## 🚀 Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [Supabase](https://supabase.com) |

---

## 🎖️ Credits
Built with a focus on **Visual Excellence**, **Campus Safety**, and **Developer Craft** by [@parsaabbasian](https://github.com/parsaabbasian).

*Verified for York University Students. 🦁*
