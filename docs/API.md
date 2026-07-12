# Forensiq REST API Documentation

This directory contains endpoint definitions for the Forensiq platform.

## Base URL
All endpoints are relative to `http://localhost/api/v1`

## Key Operations
- `POST /auth/login` - Authenticate using password and return JWT access/refresh tokens.
- `POST /alerts/ingest` - Push alert payload from SIEM setups.
- `GET /alerts` - List ingested alerts (requires JWT Authorization).
