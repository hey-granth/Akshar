# Service Boundaries (MVP)

## TypeScript Layer

- `apps/web`: TipTap editor UI, collaboration client, suggestion UI.
- `apps/realtime`: Hocuspocus websocket sync, Fastify routes, document snapshots, suggestion action API.
- `packages/contracts`: versioned `v1` schemas and types for cross-service payloads.

## Python Layer

- `apps/agent`: FastAPI endpoints, deterministic agent pipeline, context/embedding stubs, Celery worker.

## Non-Negotiable Rules

- TS and Python communicate only through explicit versioned schemas.
- Agent logic never executes in TS services.
- Realtime collaboration never depends on agent call completion.
- Suggestion application is action-based (`accept`/`reject`) and non-destructive.
