# Akshar MVP

Collaborative, agentic document editor MVP with strict separation:

- TypeScript (`bun`): `apps/web`, `apps/realtime`, `packages/contracts`
- Python (`uv`): `apps/agent`

## Requirements

- `bun`
- `uv`
- Docker (for Postgres + Redis)

## Setup

```bash
cp .env.example .env
docker compose up -d
bun install
cd apps/agent && uv sync && cd ../..
```

## Run

```bash
bun run dev:realtime
bun run dev:web
cd apps/agent && uv run uvicorn api.main:app --reload --host 0.0.0.0 --port 8001
```

## Run Celery Worker

```bash
cd apps/agent && uv run celery -A workers.tasks.celery_app worker --loglevel=INFO
```

## Notes

- Collaboration path is CRDT-based with Yjs + Hocuspocus.
- Agent endpoints return structured diff payloads only.
- Suggestions are non-destructive and actioned by `accept`/`reject`.
