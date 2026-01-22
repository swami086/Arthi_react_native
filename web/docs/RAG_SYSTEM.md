# RAG (Retrieval-Augmented Generation) System

The RAG system provides persistent, context-aware memory for AI agents, allowing them to recall past sessions, patient goals, and clinical history.

## Architecture

### 1. Vector Storage
- **Database**: Supabase PostgreSQL with `pgvector` extension.
- **Table**: `agent_memory`.
- **Column**: `embedding` (vector size: 1536).

### 2. Embedding Generation
- **Model**: `text-embedding-3-small` (OpenAI).
- **Trigger**: New memories are automatically embedded upon insertion via Edge Functions.

### 3. Retrieval Flow
1. User sends a message.
2. `rag-retrieve` Edge Function is called.
3. Query text is converted to an embedding.
4. Cosine similarity search is performed on `agent_memory`.
5. Top `k` relevant chunks are returned as context.

## Integration

### React Service
Use the `ragService` in `web/lib/services/rag-service.ts` to interact with the memory system.

```typescript
const context = await ragService.retrieveContext("patient's goals regarding anxiety", userId);
```

### Edge Functions
The `EmbeddingService` in `_shared/embedding-service.ts` provides server-side utilities for retrieval.

## Data Types
Supported memory types:
- `session_note`
- `therapist_note`
- `patient_goal`
- `wellness_check`
- `mood_entry`

## Performance
- **Threshold**: Similarity match threshold is set to `0.7` by default.
- **Limit**: Default retrieval limit is `5` chunks per query to optimize context window usage.
