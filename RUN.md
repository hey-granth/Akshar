# Run Akshar (MVP)

This guide explains exactly how to run Akshar locally.

**The easy way (recommended):** Use the `Makefile`.
**The manual way:** Run each service in a separate terminal.

## The Easy Way (using `make`)

### 1) Prerequisites

Install these first:

- `bun`
- `uv`
- `make`
- Supabase account/project (for Postgres)
- Upstash Redis database
- Docker + Docker Compose (optional, only for local Redis fallback)

### 2) Clone and configure

From the repository root:

```bash
git clone <your-repo-url>
cd Akshar
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your Supabase Postgres connection string.
Update `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env` with your Upstash Redis credentials.

### 3) Run everything

This single command will:
1. Install all JS and Python dependencies.
2. Start all four services using Supabase + Upstash.

```bash
make
```

The application is now running.

- Web UI: `http://localhost:3000`
- Realtime health: `http://localhost:4001/health`
- Agent health: `http://localhost:8001/health`

### 4) Stop everything

To stop all services and containers:

```bash
make down
```

### Other useful commands

- `make install`: Install dependencies only.
- `make test`: Run type checks and Python tests.
- `make clean`: Remove all build artifacts and `node_modules`.
- `make logs`: Tail logs from the Docker containers.
- `make up-local-redis`: Optional fallback to run local Redis + services.


## The Manual Way

Follow these steps if you want to run each service manually.

### 1) Prerequisites

Install these first:

- `bun`
- `uv`
- Supabase account/project (for Postgres)
- Upstash Redis database
- Docker + Docker Compose (optional, only for local Redis fallback)

### 2) Clone and configure

From the repository root:

```bash
git clone <your-repo-url>
cd Akshar
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your Supabase Postgres connection string.
Update `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env` with your Upstash Redis credentials.

### 3) Start infrastructure (optional local Redis fallback)

```bash
docker compose up -d redis
```

To verify containers are running:

```bash
docker compose ps
```

### 4) Install dependencies

Install JS workspace dependencies:

```bash
bun install
```

Install Python dependencies for the agent service:

```bash
cd apps/agent
uv sync --extra dev
cd ../..
```

### 5) Start services

Open 4 terminals from repo root.

#### Terminal A: Realtime service (Fastify + Hocuspocus)

```bash
bun run dev:realtime
```

#### Terminal B: Web app (Next.js)

```bash
bun run dev:web
```

#### Terminal C: Agent API (FastAPI)

```bash
cd apps/agent
uv run uvicorn api.main:app --reload --host 0.0.0.0 --port 8001
```

#### Terminal D: Agent worker (Celery)

```bash
cd apps/agent
uv run celery -A workers.tasks.celery_app worker --loglevel=INFO
```

### 6) Validate the app

- Web UI: `http://localhost:3000`
- Realtime health: `http://localhost:4001/health`
- Agent health: `http://localhost:8001/health`

Quick health checks:

```bash
curl http://localhost:4001/health
curl http://localhost:8001/health
```

### 7) Useful checks

From repo root:

```bash
bun run typecheck
```

From `apps/agent`:

```bash
uv run python -m pytest -q
```

## 8) Stop everything

Stop app processes with `Ctrl+C` in each terminal.

Stop infra:

```bash
docker compose down
```

If you also want to remove volumes:

```bash
docker compose down -v
```

## 9) Common issues

- Port already in use:
  - Check ports `3000`, `4001`, `4002`, `8001`, `6379`.
- Agent import errors:
  - Ensure you run agent commands via `uv run ...`.
- Missing env values:
  - Re-copy `.env` from `.env.example` and restart services.
- Database connection errors:
  - Verify `DATABASE_URL` points to Supabase and credentials are valid.
- Redis connection errors:
  - Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set correctly.
