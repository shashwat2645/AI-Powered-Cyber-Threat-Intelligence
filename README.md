# AI-Powered Cyber Threat Intelligence Platform

A full-stack cyber threat intelligence platform that uses machine learning to detect and analyze potential security threats with real-time alerting.

## Project Structure

```
├── backend/          # Node.js + Express.js REST API
├── ml/              # Python Flask API for ML models
├── frontend/         # React.js application
├── database/        # MySQL schema files
├── docker-compose.yml
├── .env.example
└── README.md
```

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.io, MySQL, JWT
- **ML**: Python, Flask, scikit-learn, Isolation Forest
- **Frontend**: React.js, Axios, Recharts, Socket.io, react-hot-toast, TailwindCSS
- **Database**: MySQL 8.0
- **Containerization**: Docker, Docker Compose

## Features

- **Phishing Detection**: Random Forest classifier trained on URL features
- **Login Anomaly Detection**: Isolation Forest for unauthorized access detection
- **Real-time Alerts**: Socket.io for live threat notifications
- **Dashboard**: Interactive charts with threat statistics
- **Threat Scanner**: ML-powered URL analysis with confidence scores
- **Rate Limiting**: Brute force protection on auth endpoints

## Quick Start (Docker)

```bash
# Clone and navigate to project
cd /path/to/scaffold

# Copy environment file
cp .env.example .env

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# ML API: http://localhost:5001
```

## Quick Start (Manual)

### Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### ML API

```bash
cd ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
# Runs on http://localhost:5001
```

### Backend

```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| MYSQL_ROOT_PASSWORD | MySQL root password | rootpassword |
| MYSQL_DATABASE | Database name | threat_intel |
| PORT | Backend port | 5000 |
| ML_PORT | ML API port | 5001 |
| JWT_SECRET | JWT signing secret | (change me) |
| REACT_APP_API_URL | Frontend API URL | http://localhost:5000/api |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login (checks ML anomaly) |
| GET | /api/auth/me | Get current user |

### Threats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/threats | List threats (paginated) |
| GET | /api/threats/:id | Get threat by ID |
| POST | /api/threats/scan | Scan URL via ML |
| POST | /api/threats | Create threat |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Get statistics |

### ML API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /predict | Phishing detection |
| POST | /detect-login | Anomaly detection |

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│  Backend   │────▶│   MySQL    │
│  (React)   │◀──��─│ (Express)  │◀────│   (8.0)    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │
      │ Socket.io         │ ML API
      ▼                   ▼
┌─────────────┐     ┌─────────────┐
│ Real-time  │     │   Flask    │
│ Toasts    │     │  (ML API)  │
└─────────────┘     └─────────────┘
```

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| mysql | 3306 | MySQL database |
| ml-api | 5001 | Python ML API |
| backend | 3001→5000 | Node.js API |
| frontend | 3000 | React app (Nginx) |

## Security Features

- JWT authentication
- Bcrypt password hashing
- Express rate limiting
- ML-powered login anomaly detection
- Real-time threat notifications
- SQL injection prevention (parameterized queries)

## ML Models

- **Phishing Detector**: Random Forest classifier
  - Features: URL length, special chars, IP format, subdomains, HTTPS, domain age, entropy
- **Login Anomaly Detector**: Isolation Forest
  - Features: time of day, failed attempts, IP reputation, geolocation change, device fingerprint

## License

MIT