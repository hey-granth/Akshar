# Akshar MVP

Collaborative, agentic document editor MVP with strict separation:

- TypeScript (`bun`): `apps/web`, `apps/realtime`, `packages/contracts`
- Python (`uv`): `apps/agent`

## Requirements

- `bun`
- `uv`
- Supabase project (for Postgres)
- Upstash Redis database
- Docker (optional, only for local Redis fallback)

## Setup

```bash
cp .env.example .env
bun install
cd apps/agent && uv sync && cd ../..
```

Set `DATABASE_URL` in `.env` to your Supabase Postgres connection string.
Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env` to your Upstash Redis credentials.

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
