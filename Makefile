.DEFAULT_GOAL := help

.PHONY: help setup dev build test audit clean install-hooks

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

setup: ## Install dependencies, configure git pre-push hooks, and verify environment
	@echo "🏛️  Setting up Philosophia development environment..."
	@which node >/dev/null 2>&1 || (echo "❌ Node.js is required (v20+ recommended)."; exit 1)
	@which npm >/dev/null 2>&1 || (echo "❌ npm is required."; exit 1)
	@npm install
	@$(MAKE) install-hooks
	@echo "🧪 Verifying setup via tests and canon audit..."
	@npm test
	@npm run audit
	@echo ""
	@echo "✨ Setup complete! Git pre-push hooks active and environment verified."
	@echo "Run 'make dev' to launch local development server."

install-hooks: ## Configure git to use version-controlled .githooks directory
	@git config core.hooksPath .githooks || true
	@chmod +x .githooks/pre-push || true
	@echo "🔒 Git hooks installed from .githooks (pre-push active)."

dev: ## Start Next.js development server
	npm run dev

build: ## Compile modular data and build static Next.js production export
	npm run build

test: ## Run Vitest test suites
	npm test

audit: ## Run canon coverage and dialectical pathfinding audit
	npm run audit:report

clean: ## Remove build artifacts and temporary files
	rm -rf out .next public/data tsconfig.tsbuildinfo
	@echo "🧹 Cleaned build artifacts."
