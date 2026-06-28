-- Migration: 20260628008_enable_pgvector
-- Description: Enable pgvector extension to prepare for the AI assistant (ADR-006 G.2)
-- Reference: docs/decisions/ADR-006-assistente-ai-provider-agnostic.md
-- No tables yet: knowledge_chunks and the RAG schema land in the dedicated AI phase.

CREATE EXTENSION IF NOT EXISTS vector;

-- ROLLBACK:
-- DROP EXTENSION IF EXISTS vector;
