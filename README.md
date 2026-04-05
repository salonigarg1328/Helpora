# 🚨 Helpora – Smart Disaster Management & Relief Coordination Platform

Helpora is a full‑stack web application that connects disaster victims with nearby NGOs in real time. Victims can report emergencies (including SOS), specify needed resources (type & quantity), and receive live status updates. NGOs can view nearby reports, get intelligent match recommendations, manage their inventory, and coordinate responses – all in real time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://www.mongodb.com/atlas)

---

## ✨ Key Features

- **Role‑based authentication** (Victim, NGO, Admin) with JWT & bcrypt
- **Real‑time disaster reporting** (Socket.io) – new reports appear instantly on NGO dashboards
- **Geospatial matching** – NGOs see reports within a configurable radius (MongoDB `2dsphere` & `$near`)
- **Smart resource allocation** – Victims specify needed resources (e.g., food 50 kg, water 100 L). NGOs see match badges and a ranked list of nearby organisations
- **Auto‑deduction of resources** – When an NGO accepts a report, requested quantities are deducted from their inventory
- **Low‑stock alerts** – NGOs receive real‑time warnings when a resource falls below 20 units
- **Request & response history** – Victims can view all their past reports; NGOs see their accepted/resolved reports
- **Interactive map picker** – Leaflet + OpenStreetMap with BigDataCloud reverse geocoding (free, keyless)
- **Admin panel** – Verify NGOs, view system statistics (total reports, pending reports, etc.)
- **Forgot / reset password** – Secure token‑based flow
- **SOS flag** – Overrides report urgency to “critical” and triggers immediate alerts

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, Tailwind CSS, Axios, Socket.io‑client, Leaflet, React Router, React Hot Toast |
| **Backend** | Node.js, Express, Socket.io, JWT, bcrypt, Nodemailer |
| **Database** | MongoDB Atlas, Mongoose ODM (2dsphere geospatial indexes) |
| **Geocoding** | BigDataCloud (reverse), OpenStreetMap (forward search) |
| **Deployment** | (Planned) Render (backend), Vercel (frontend), MongoDB Atlas |

---

## 📁 Project Structure

```
Helpora/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI (MapPicker, ResourceManager, etc.)
│ │ ├── pages/ # All views (LandingPage, Login, Dashboard...)
│ │ ├── services/ # API calls & socket
│ │ └── App.jsx
│ └── package.json
├── server/ # Node.js backend
│ ├── config/ # Database connection
│ ├── controllers/ # Business logic (auth, reports, resources, admin)
│ ├── models/ # Mongoose schemas (User, DisasterReport, Resource)
│ ├── routes/ # Express routes
│ ├── middleware/ # JWT protection & role checks
│ ├── utils/ # JWT helpers, geospatial distance
│ └── app.js
└── README.md

text
This renders as a clean, indented tree. The backticks (```) create a monospaced block, and the spaces/line characters (├─, │, └─) are standard Unicode that work on GitHub and most Markdown renderers.

what to cipy paste
We need to provide the exact Markdown code that the user can copy-paste into their README.md to display the directory tree. The user asked "what to cipy paste". So we should output the code block content.

Here's the exact Markdown you can copy and paste into your README.md file to display the directory tree:

markdown
Helpora/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI (MapPicker, ResourceManager, etc.)
│ │ ├── pages/ # All views (LandingPage, Login, Dashboard...)
│ │ ├── services/ # API calls & socket
│ │ └── App.jsx
│ └── package.json
├── server/ # Node.js backend
│ ├── config/ # Database connection
│ ├── controllers/ # Business logic (auth, reports, resources, admin)
│ ├── models/ # Mongoose schemas (User, DisasterReport, Resource)
│ ├── routes/ # Express routes
│ ├── middleware/ # JWT protection & role checks
│ ├── utils/ # JWT helpers, geospatial distance
│ └── app.js
└── README.md
```


---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB Atlas account (free tier) or local MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/helpora.git
   cd helpora
   ```
2. Backend Set Up
   ```bash
   cd server
   npm install
   ```
3.Frontend setup
  ```bash
cd ../client
npm install
```
4.Run the app

Backend: ```cd server && npm run dev```

Frontend: ```cd client && npm run dev```
5. Open ```http://localhost:5173```

Testing

1.Register a victim and an NGO (NGO needs location)

2.Victim creates a report with needed resources

3.NGO sees report with match badge, accepts → resources deducted

4.Victim receives notification; history updates

5.Admin verifies NGOs and views statistics
