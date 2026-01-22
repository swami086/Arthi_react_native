# A2UI Guide for Agents

A2UI (Agent-to-UI) is our internal framework for generating dynamic, real-time UI surfaces from AI agents.

## Core Concepts

### 1. Surfaces
A **Surface** is a logical container for AI interaction (e.g., a Sidebar, a Dashboard, or a Chat interface). Each surface has:
- `components`: Array of UI elements to render.
- `dataModel`: Reactive data store for component state.
- `metadata`: Static configuration and context.

### 2. Components
We support a catalog of predefined components in `web/components/ai/`:
- `a2ui-booking-interface.tsx`
- `a2ui-copilot-sidebar.tsx`
- `a2ui-insights-dashboard.tsx`
- `a2ui-followup-form.tsx`

### 3. Actions
Actions are events triggered by the UI (e.g., button clicks) sent back to the agent for processing.

## Implementation Guide

### 1. Use the Hook
All A2UI interactions should use the `useA2UI` hook or a specialized wrapper.

```typescript
const { surface, sendAction } = useA2UI({ userId, agentId, surfaceId });
```

### 2. Render the Surface
Map the surface components to React components.

```tsx
{surface.components.map(c => (
    <A2UIComponentRenderer key={c.id} component={c} />
))}
```

### 3. Handle Updates
Updates are pushed in real-time via Supabase Broadcast:
- `surfaceUpdate`: Replaces or updates the entire surface configuration.
- `dataModelUpdate`: Incremental update to the reactive data store (using JSON patches).

## Security
A2UI implements strict security protocols:
- **HIPAA Logging**: Every interaction is logged for audit trails.
- **Message Validation**: All broadcast messages are validated against a Zod schema.
- **Sanitization**: Input strings are sanitized to prevent XSS.
