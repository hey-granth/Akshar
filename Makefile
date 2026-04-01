.PHONY: all install up down logs test clean

all: run

# ====================================================================================
# INSTALLATION
# ====================================================================================

install:
	@echo "Installing all dependencies..."
	@echo "Installing JS dependencies..."
	bun install
	@echo "Installing Python dependencies..."
	(cd apps/agent && uv sync --extra dev)
	@echo "Installation complete."

# ====================================================================================
# RUNNING THE APP
# ====================================================================================

run: install up

up:
	@echo "Starting infrastructure..."
	docker compose up -d
	@echo "Starting services in parallel..."
	@trap "make down" INT; \
	( \
		echo "--> Starting Realtime service..." && \
		bun run dev:realtime & \
		echo "--> Starting Web app..." && \
		bun run dev:web & \
		echo "--> Starting Agent API..." && \
		(cd apps/agent && uv run uvicorn api.main:app --reload --host 0.0.0.0 --port 8001) & \
		echo "--> Starting Agent worker..." && \
		(cd apps/agent && uv run celery -A workers.tasks.celery_app worker --loglevel=INFO) \
	)

down:
	@echo "Stopping all services..."
	@pkill -f "bun run dev:realtime" || true
	@pkill -f "bun run dev:web" || true
	@pkill -f "uvicorn api.main:app" || true
	@pkill -f "celery -A workers.tasks.celery_app worker" || true
	@echo "Stopping infrastructure..."
	docker compose down
	@echo "All services stopped."

# ====================================================================================
# UTILITIES
# ====================================================================================

logs:
	@echo "Tailing logs for all services..."
	docker compose logs -f

test:
	@echo "Running type checks..."
	bun run typecheck
	@echo "Running Python tests..."
	(cd apps/agent && uv run python -m pytest -q)
	@echo "All tests passed."

clean:
	@echo "Cleaning up..."
	rm -rf node_modules
	rm -rf apps/web/node_modules
	rm -rf apps/realtime/node_modules
	rm -rf packages/contracts/node_modules
	rm -rf apps/web/.next
	(cd apps/agent && rm -rf .pytest_cache .ruff_cache)
	@echo "Clean complete."
