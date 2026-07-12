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

## ⚡ Quick Start & Setup Guide

Follow these steps to clone, configure, run, and test the Forensiq platform on your local machine.

### 1. Prerequisites
Before getting started, make sure you have the following installed:
*   [Docker Engine >= 20.10](https://docs.docker.com/engine/install/)
*   [Docker Compose >= v2.10](https://docs.docker.com/compose/)
*   `curl` or any API testing client (e.g. Postman) for webhook ingestion testing.

---

### 2. Clone the Repository
Clone the project to your local workstation:
```bash
git clone https://github.com/sakshipatil45/Forensiq.git
cd Forensiq
```

---

### 3. Initialize Environment Configurations
Create a local `.env` configuration file from the blueprint:
*   On **macOS/Linux**:
    ```bash
    cp .env.example .env
    ```
*   On **Windows (PowerShell)**:
    ```powershell
    Copy-Item .env.example .env
    ```

Ensure the `.env` contains the required credentials. Default configurations are pre-populated for sandbox testing:
```ini
# Core API Key required for ingesting webhook alerts from SIEMs
INGEST_API_KEY=forensiq_super_secure_ingest_key_123

# Database configuration
DATABASE_URL=postgresql+asyncpg://postgres:supersecuredbpass123@postgres:5432/forensiq
```

---

### 4. Build and Launch Containers
Run the Docker Compose suite to build, compile, and launch all platform services in the background:
```bash
docker compose build
docker compose up -d
```

#### Automated Startup Database Seeding:
During container initialization, the `api-backend` service automatically runs migrations and triggers a database lifespan task to configure initial values:
1.  Creates PostgreSQL tables.
2.  Seeds operational security permissions (`read:alerts`, `write:alerts`, `manage:users`).
3.  Seeds default roles (`socanalyst`, `orgadmin`, `readonly`) linked to permissions.
4.  Provisions a default sandbox organization named **Default Sandbox Org**.
5.  Seeds a default analyst account:
    *   **Email**: `analyst@forensiq.ai`
    *   **Password**: `password123`

---

### 5. Access Service Portals
Once the containers report active and healthy statuses, navigate to the following local routes:

*   **Analyst Interface (Next.js Dashboard)**: [http://localhost/](http://localhost/)
*   **Interactive Swagger Documentation (FastAPI)**: [http://localhost/api/docs](http://localhost/api/docs)
*   **pgAdmin Database Console**: [http://localhost:5050](http://localhost:5050)
    *   *Username*: `admin@forensiq.local`
    *   *Password*: `adminpass123`

---

### 6. Logging In
1.  Open the web browser and visit [http://localhost/](http://localhost/).
2.  Click **Launch Platform** or **Sign In**.
3.  Use the pre-seeded sandbox credentials:
    *   **Username**: `analyst@forensiq.ai`
    *   **Password**: `password123`
4.  Upon successful validation, you will be redirected to the secure **SOC Command Center Dashboard**.

---

### 7. Testing Alert Ingestion (Webhook API Keys & Transactions)
To simulate alert forwarding from external SIEM agents (like Wazuh or Splunk), send a webhook payload using `curl`. Webhook endpoints require passing the `X-API-Key` header:

*   **Command**:
    ```bash
    curl -X POST http://localhost/api/alerts/ingest \
      -H "Content-Type: application/json" \
      -H "X-API-Key: forensiq_super_secure_ingest_key_123" \
      -d '{
        "source": "Wazuh",
        "event_id": "evt_998877",
        "title": "Brute Force Attack Detected",
        "severity": "high",
        "timestamp": "2026-07-12T12:00:00Z",
        "payload": {
          "source_ip": "192.168.1.100",
          "failures": 15,
          "target_user": "admin"
        }
      }'
    ```

#### What happens behind the scenes:
1.  **API Key Validation**: The backend checks if the `X-API-Key` matches the `INGEST_API_KEY` defined in the env configuration.
2.  **ACID Transactional Creation**: An Alert record and a corresponding queued Investigation record are created atomically. If either fails, the transaction rolls back.
3.  **Task Offloading**: An asynchronous Celery task `tasks.trigger_investigation` is offloaded to the background worker.
4.  **AI Engine Analysis**: The worker queries the LangGraph AI service (`http://ai-services:8001/analyze`) to simulate multi-agent triage, calculates a dynamic risk score, generates an executive markdown incident report, and saves the results back to PostgreSQL.

---

### 8. Monitoring System Logs
You can view the real-time background execution loops by trailing the Celery task logs:
```bash
docker compose logs -f celery-worker
```

---

## 🛠️ Service Ingress Routing (via Nginx)
*   `http://localhost/` -> Proxied internally to `web-frontend:3000` (Next.js client)
*   `http://localhost/api/` -> Proxied internally to `api-backend:8000` (FastAPI core)
*   `ws://localhost/api/v1/ws/` -> Upgraded WebSockets route for real-time telemetry updates.

---

## ⚠️ Troubleshooting & Reset
If you modify the database models or need to reset the sandbox environment to a pristine state:
1.  Tear down containers and delete PostgreSQL volumes:
    ```bash
    docker compose down -v
    ```
2.  Rebuild and launch:
    ```bash
    docker compose up -d --build
    ```
