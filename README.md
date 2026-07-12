# Forensiq — Intelligent Security Operations & Investigation Platform

Forensiq is an AI-powered Security Operations Center (SOC) platform designed to automate security alert investigation. By utilizing a modular multi-agent system, it ingests threat telemetry, extracts IOCs, fetches threat intelligence data, maps incidents to the MITRE ATT&CK framework, reconstructs causality timelines, and scores incident risks.

---

## 📁 Repository Structure
```
forensiq/
├── backend/            # FastAPI REST Core, Celery task runners, SQLAlchemy models
├── frontend/           # Next.js 15 operational dashboard (TypeScript, Tailwind, Recharts)
├── ai-services/        # Python LangGraph state graph & multi-agent architecture definitions
├── infra/              # Configuration files for system ingress proxies (Nginx)
├── docs/               # Technical designs and APIs definitions
├── datasets/           # Mock data streams for parsing alerts
├── scripts/            # Database seeding and utility files
├── docker-compose.yml  # System orchestration layout
├── Makefile            # Developer helper shortcuts
└── .env.example        # Environment variables blueprint
```

---

## ⚡ Quick Start

### Prerequisites
- Docker Engine >= 20.10
- Docker Compose >= 2.10
- Makefile utility (optional)

### Running Locally
1. Clone the repository and navigate to the project directory.
2. Initialize the environment configuration:
   ```bash
   cp .env.example .env
   ```
3. Start the entire platform infrastructure:
   ```bash
   make build
   make up
   ```
4. Access the different service portals:
   - **Analyst Interface**: `http://localhost/`
   - **Core API Swagger Documentation**: `http://localhost/api/docs`
   - **pgAdmin Database Console**: `http://localhost:5050` (credentials in `docker-compose.yml`)

---

## ⚙️ Service Ports & Routing (via Nginx)

- `http://localhost/` -> Proxied internally to `web-frontend:3000` (Next.js)
- `http://localhost/api/` -> Proxied internally to `api-backend:8000` (FastAPI)
- `ws://localhost/api/v1/ws/` -> Upgraded WebSockets route for real-time telemetry updates.
