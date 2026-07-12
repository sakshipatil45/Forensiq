# Forensiq Platform Orchestration Makefile

.PHONY: build up down restart logs ps clean db-migrate

# Build all docker containers
build:
	docker compose build

# Start all docker containers in background
up:
	docker compose up -d

# Stop and remove containers, networks, and volumes
down:
	docker compose down -v

# Restart all containers
restart:
	docker compose restart

# View logs from all containers
logs:
	docker compose logs -f

# List container status
ps:
	docker compose ps

# Run database migrations using backend context
db-migrate:
	docker compose exec api-backend alembic revision --autogenerate -m "auto_migration"
	docker compose exec api-backend alembic upgrade head

# Clean temporary Python/Node artifacts
clean:
	rm -rf backend/__pycache__ backend/app/__pycache__ ai-services/app/__pycache__ frontend/.next frontend/node_modules
