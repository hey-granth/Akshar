# PLAN.md

## Goal

Build a collaborative, agentic document editor with real-time sync and AI-powered suggestions.

---

## Phase 0: Foundations

### Objectives

* Set up basic repo structure
* Define architecture boundaries

### Tasks

* Create mono-repo (pnpm / turborepo)
* Services:

  * frontend (Next.js)
  * realtime (Fastify + Hocuspocus)
  * agent (FastAPI)
* Setup Docker + docker-compose
* Setup PostgreSQL + Redis

---

## Phase 1: Editor + Collaboration Core

### Objectives

* Functional collaborative editor

### Tasks

* Integrate TipTap editor
* Define schema (paragraph, heading, lists, code blocks)
* Setup Yjs document model
* Setup Hocuspocus server
* Connect frontend ↔ Hocuspocus via WebSocket
* Add presence (cursor, users)
* Persist documents (Yjs snapshots → Postgres)

### Output

* Multiple users editing same doc in real-time

---

## Phase 2: Document Model + Storage

### Objectives

* Structured document representation

### Tasks

* Store metadata (title, owner, collaborators)
* Versioning system (snapshots)
* Block-level IDs for sections
* Export pipeline (JSON → Markdown)

### Output

* Stable document storage and retrieval

---

## Phase 3: Agent API (FastAPI)

### Objectives

* Basic AI capabilities

### Tasks

* Setup FastAPI service
* Add endpoints:

  * /rewrite-section
  * /summarize
  * /analyze
* Integrate LLM (OpenAI/Ollama)
* Define structured response format (diff-based)

### Output

* API returns suggestions for document sections

---

## Phase 4: Suggestion System

### Objectives

* Non-destructive AI edits

### Tasks

* Define diff format
* UI for suggestions (accept/reject)
* Map diff → ProseMirror transactions
* Store suggestion history

### Output

* AI suggestions visible and controllable

---

## Phase 5: Background Jobs

### Objectives

* Async processing

### Tasks

* Setup Celery + Redis
* Trigger jobs from events:

  * on edit (debounced)
  * on idle
  * on manual action
* Queue agent tasks

### Output

* Non-blocking agent execution

---

## Phase 6: Context + Memory

### Objectives

* Make agent aware of document

### Tasks

* Chunk document into sections
* Generate embeddings
* Store in pgvector
* Retrieval pipeline for context

### Output

* Context-aware suggestions

---

## Phase 7: Multi-Agent System

### Objectives

* Role-based agents

### Tasks

* Implement roles:

  * writer
  * editor
  * reviewer
* Sequential pipeline execution
* Add simple planner (optional)

### Output

* Improved suggestion quality

---

## Phase 8: Event-Driven Agent Triggers

### Objectives

* Autonomous behavior

### Tasks

* Hook into events:

  * edit
  * comment
  * publish
* Define rules for triggering agents
* Add throttling

### Output

* Agent runs without manual prompts

---

## Phase 9: Performance + Scaling

### Objectives

* System stability

### Tasks

* Cache embeddings
* Rate limit LLM calls
* Optimize chunking
* Horizontal scaling (workers)

### Output

* Cost-controlled and scalable system

---

## Phase 10: Advanced Features

### Objectives

* Product differentiation

### Tasks

* Auto-outline generation
* Cross-section consistency checks
* Style enforcement
* Collaboration-aware suggestions

### Output

* True agentic behavior

---

## Phase 11: Deployment

### Objectives

* Production readiness

### Tasks

* Setup Nginx gateway
* Deploy services (Docker)
* Setup CI/CD
* Monitoring (logs, metrics)

### Output

* Live system

---

## Key Principles

* Never block editor with agent calls
* Always return diffs, not raw text
* Keep agent logic explicit and debuggable
* Optimize for iteration speed

---

## MVP Scope

* Collaborative editor (Yjs + TipTap)
* Manual AI actions (rewrite, summarize)
* Suggestion system (accept/reject)

Everything else is iterative.
