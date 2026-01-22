# A2UI Infrastructure Documentation

## Overview

The A2UI (Agent-to-UI) infrastructure enables dynamic, bidirectional communication between AI agents and the TherapyFlow web application. It allows agents to create, update, and manage UI components in real-time while receiving user interactions back.

## Architecture

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│             │  surfaceUpdate     │              │  Realtime Channel  │             │
│  AI Agent   │───────────────────▶│   Supabase   │◀──────────────────▶│  React UI   │
│             │  dataModelUpdate   │   Realtime   │                    │             │
│             │◀───────────────────│              │  action messages   │             │
└─────────────┘                    └──────────────┘                    └─────────────┘
                                                                              │
                                                                              ▼
                                                                    ┌──────────────────┐
                                                                    │  A2UIRenderer    │
                                                                    │  - Validation    │
                                                                    │  - Data Binding  │
                                                                    │  - Action Handling│
                                                                    └──────────────────┘
```

## Core Concepts

### 1. Surfaces

A **Surface** is a container for A2UI components with an associated data model:

```typescript
interface A2UISurface {
  surfaceId: string;        // Unique identifier
  userId: string;           // Owner user ID
  agentId: string;          // Managing agent ID
  components: A2UIComponent[]; // UI components to render
  dataModel: Record<string, any>; // Data for binding
  metadata?: Record<string, any>; // Additional metadata
  version: number;          // Version for optimistic updates
}
```

### 2. Components

Components are the building blocks of the UI, mapped to existing TherapyFlow components:

```typescript
interface A2UIComponent {
  type: string;             // Component type (must be in catalog)
  id: string;               // Unique ID within surface
  props?: Record<string, any>; // Component props
  children?: A2UIComponent[]; // Child components
  dataBinding?: Record<string, A2UIDataBinding>; // Data bindings
  actions?: string[];       // Allowed action IDs
}
```

### 3. Data Binding

Data binding uses JSON Pointer (RFC 6901) to reference data in the surface's data model:

```typescript
interface A2UIDataBinding {
  path: string;             // JSON Pointer path (e.g., '/data/moodScore')
  fallback?: any;           // Fallback value if path doesn't exist
  transform?: string | Function; // Optional transform function
}
```

**Example:**
```typescript
{
  type: 'Input',
  id: 'mood-input',
  props: {
    label: 'Mood Score',
    type: 'number'
  },
  dataBinding: {
    value: {
      path: '/data/moodScore',
      fallback: 5
    }
  }
}
```

### 4. Actions

Actions represent user interactions that are sent back to the agent:

```typescript
interface A2UIAction {
  actionId: string;         // Unique action identifier
  type: string;             // Action type (click, change, etc.)
  payload?: any;            // Action data
  metadata?: Record<string, any>; // Additional context
  timestamp?: string;       // When action occurred
}
```

## Component Catalog

The following components are available in the A2UI catalog:

| Component | Category | Description | Key Props |
|-----------|----------|-------------|-----------|
| `Button` | input | Primary button with variants | variant, size, isLoading, onClick |
| `Card` | layout | Container card | className, children |
| `CardHeader` | layout | Card header section | children |
| `CardTitle` | layout | Card title text | children |
| `CardDescription` | layout | Card description | children |
| `CardContent` | layout | Card content section | children |
| `CardFooter` | layout | Card footer section | children |
| `Input` | input | Text input with label | label, error, type, value, onChange |
| `Slider` | input | Range slider | min, max, value, onValueChange |
| `Switch` | input | Toggle switch | checked, onCheckedChange |
| `SessionCard` | display | Therapy session card | title, date, status, patientName, onClick |
| `TherapistCard` | display | Therapist profile card | name, role, rating, expertise, onClick |

## Message Types

### SurfaceUpdate

Create, update, replace, or delete a surface:

```typescript
{
  type: 'surfaceUpdate',
  operation: 'create' | 'update' | 'replace' | 'delete',
  surfaceId: 'surface-123',
  userId: 'user-456',
  agentId: 'agent-789',
  components: [...],
  dataModel: {...}
}
```

### DataModelUpdate

Update specific data model fields using JSON Pointer paths:

```typescript
{
  type: 'dataModelUpdate',
  surfaceId: 'surface-123',
  updates: {
    '/data/moodScore': 8,
    '/therapists/0/isOnline': true
  }
}
```

### DeleteSurface

Remove a surface:

```typescript
{
  type: 'deleteSurface',
  surfaceId: 'surface-123'
}
```

### Action (UI to Agent)

User interaction sent to agent:

```typescript
{
  type: 'action',
  surfaceId: 'surface-123',
  userId: 'user-456',
  actionId: 'submit-mood',
  actionType: 'click',
  payload: { moodScore: 8 }
}
```

## Usage Examples

### 1. Using the Hook

```typescript
import { useA2UI } from '@/lib/a2ui';

function MyComponent() {
  const { surfaces, loading, error, sendAction, connected } = useA2UI({
    userId: 'user-123',
    agentId: 'wellness-agent',
    enableRealtime: true
  });

  const handleAction = async (action: A2UIAction) => {
    await sendAction(action);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {Array.from(surfaces.values()).map(surface => (
        <A2UIRenderer
          key={surface.surfaceId}
          surface={surface}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}
```

### 2. Creating a Surface (Agent Side)

## New Agent Integration Guide

To integrate a new AI Agent with TherapyFlow via A2UI, follow these steps:

### 1. Connection Setup
Agents communicate via Supabase Realtime. Your agent must:
- Have access to the Supabase Service Role Key (for database operations) or a valid JWT.
- Subscribe to the user's channel: `a2ui:user_<uuid>`.

### 2. Surface Lifecycle
1. **Initialize**: Broadcast a `surfaceUpdate` with `operation: 'create'` to establish the initial UI and Data Model.
2. **Update**: Use `dataModelUpdate` specifically for state changes to minimize bandwidth.
3. **Re-render**: Use `surfaceUpdate` with `operation: 'update'` or `'replace'` if the UI structure changes (e.g., adding a new tool).
4. **Cleanup**: Send `deleteSurface` when the agent session ends or the context is no longer relevant.

### 3. Handling Actions
Listen for `action` events on the same channel:
- `surfaceId`: To identify which UI triggered the action.
- `actionId`: The specific handler name you provided in the component props.
- `payload`: Data gathered from the UI (e.g., input values).

### 4. Best Practices
- **Payload Minimization**: Keep `dataModel` lean. Large models slow down client-side reconciliation.
- **Idempotency**: Use stable IDs for components to allow A2UI to perform efficient React updates.
- **Error Handling**: Monitor for action timeouts. If the agent doesn't respond, the UI may need to show a retry state.

## Component Example Messages

Each component in the catalog supports specific schemas. See the examples below for detailed JSON payloads:

- [Button](examples/Button.json)
- [RiskAlert](examples/RiskAlert.json)
- [SessionCard](examples/SessionCard.json) (Pending)
- [Slider](examples/Slider.json) (Pending)

### 2. Creating a Surface (Agent Side)

```typescript
// Agent creates a mood tracking surface
const surface = {
  type: 'surfaceUpdate',
  operation: 'create',
  surfaceId: 'mood-tracker-1',
  userId: 'user-123',
  agentId: 'wellness-agent',
  components: [
    {
      type: 'Card',
      id: 'mood-card',
      children: [
        {
          type: 'CardHeader',
          id: 'card-header',
          children: [
            {
              type: 'CardTitle',
              id: 'card-title',
              props: { children: 'How are you feeling today?' }
            }
          ]
        },
        {
          type: 'CardContent',
          id: 'card-content',
          children: [
            {
              type: 'Slider',
              id: 'mood-slider',
              props: {
                min: 1,
                max: 10,
                label: 'Mood Score',
                onValueChange: 'mood-changed'
              },
              dataBinding: {
                value: { path: '/data/moodScore', fallback: [5] }
              }
            }
          ]
        },
        {
          type: 'CardFooter',
          id: 'card-footer',
          children: [
            {
              type: 'Button',
              id: 'submit-btn',
              props: {
                children: 'Submit',
                onClick: 'submit-mood'
              }
            }
          ]
        }
      ]
    }
  ],
  dataModel: {
    data: {
      moodScore: 5
    }
  }
};

// Broadcast via Supabase channel
await supabase.channel('a2ui:user-123').send({
  type: 'broadcast',
  event: 'surfaceUpdate',
  payload: surface
});
```

### 3. Updating Data Model

```typescript
// Agent updates mood score after analysis
const update = {
  type: 'dataModelUpdate',
  surfaceId: 'mood-tracker-1',
  updates: {
    '/data/moodScore': 7,
    '/data/lastUpdated': new Date().toISOString()
  }
};

await supabase.channel('a2ui:user-123').send({
  type: 'broadcast',
  event: 'dataModelUpdate',
  payload: update
});
```

## Security Features

### 1. Component Whitelisting

Only components in the catalog can be rendered. Attempts to render unknown components are blocked and logged.

### 2. Props Validation

All component props are validated against JSON schemas before rendering.

### 3. XSS Prevention

- Script tags are stripped from string values
- Event handlers in strings are removed
- All messages are sanitized before processing

### 4. Path Traversal Protection

- JSON Pointer paths are validated
- Path traversal attempts (../) are blocked
- Path depth is limited to 10 levels

### 5. Rate Limiting

- Maximum 10 actions per second per surface
- Prevents action flooding attacks

## Data Binding Transforms

Built-in transforms for data manipulation:

```typescript
// Uppercase transform
{ path: '/user/name', transform: 'uppercase' }

// Lowercase transform
{ path: '/user/email', transform: 'lowercase' }

// Date formatting
{ path: '/session/date', transform: 'date-format' }

// Number formatting
{ path: '/payment/amount', transform: 'number-format' }

// Truncate long text
{ path: '/bio/description', transform: 'truncate' }

// Custom function
{ 
  path: '/data/score',
  transform: (value) => value * 100 + '%'
}
```

## Error Handling

### Validation Errors

```typescript
import { validateMessage } from '@/lib/a2ui';

const result = validateMessage(message);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Rendering Errors

The renderer includes error boundaries that catch and display rendering errors gracefully:

```typescript
<A2UIRenderer
  surface={surface}
  onAction={handleAction}
  debug={true} // Show detailed error messages
/>
```

### Rollbar Integration

All errors are automatically logged to Rollbar with context:

```typescript
reportError(error, 'a2ui.render_error', {
  surfaceId: surface.surfaceId,
  componentType: component.type
});
```

## Database Schema

Required Supabase table structure:

```sql
CREATE TABLE a2ui_surfaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surface_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_id TEXT NOT NULL,
  components JSONB NOT NULL DEFAULT '[]',
  data_model JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_a2ui_surfaces_user_id ON a2ui_surfaces(user_id);
CREATE INDEX idx_a2ui_surfaces_agent_id ON a2ui_surfaces(agent_id);
CREATE INDEX idx_a2ui_surfaces_surface_id ON a2ui_surfaces(surface_id);

-- RLS Policies
ALTER TABLE a2ui_surfaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own surfaces"
  ON a2ui_surfaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all surfaces"
  ON a2ui_surfaces FOR ALL
  USING (auth.role() = 'service_role');
```

## Testing

### Manual Testing Checklist

- [ ] Component rendering with all catalog components
- [ ] Data binding with various JSON Pointer paths
- [ ] Action handling and message sending
- [ ] Realtime updates (surfaceUpdate, dataModelUpdate, deleteSurface)
- [ ] Validation with invalid messages and components
- [ ] Error boundaries with malformed data
- [ ] Dark mode rendering
- [ ] Responsive behavior on mobile and desktop

### Integration Testing

```typescript
// Create test surface
const testSurface: A2UISurface = {
  surfaceId: 'test-surface',
  userId: 'test-user',
  agentId: 'test-agent',
  components: [
    {
      type: 'Button',
      id: 'test-btn',
      props: {
        children: 'Test Button',
        onClick: 'test-action'
      }
    }
  ],
  dataModel: {},
  version: 1
};

// Render and test
const { getByText } = render(
  <A2UIRenderer
    surface={testSurface}
    onAction={mockActionHandler}
  />
);

const button = getByText('Test Button');
fireEvent.click(button);

expect(mockActionHandler).toHaveBeenCalledWith({
  actionId: 'test-action',
  type: 'onClick',
  payload: expect.anything()
});
```

## Troubleshooting

### Surface Not Rendering

1. Check browser console for validation errors
2. Verify surface structure matches schema
3. Ensure all component types are in catalog
4. Check Supabase connection status

### Data Binding Not Working

1. Verify JSON Pointer path syntax
2. Check that data exists in dataModel
3. Ensure path doesn't exceed 10 levels
4. Test with fallback values

### Actions Not Sending

1. Check realtime connection status
2. Verify action IDs match component props
3. Check rate limiting (max 10/sec)
4. Review Rollbar logs for errors

### Realtime Updates Not Received

1. Verify Supabase channel subscription
2. Check channel name format: `a2ui:${userId}`
3. Ensure message validation passes
4. Check browser network tab for WebSocket connection

## File Structure

```
web/
├── lib/
│   └── a2ui/
│       ├── index.ts              # Main export
│       ├── types.ts              # TypeScript definitions
│       ├── component-catalog.ts  # Component mapping
│       ├── message-validator.ts  # Validation logic
│       └── renderer.tsx          # React renderer
├── hooks/
│   └── use-a2ui.ts              # Supabase hook
└── components/
    └── ui/
        └── slider.tsx            # Slider component
```

## Future Enhancements

- [ ] Component composition helpers
- [ ] Animation support for component updates
- [ ] Conditional rendering based on data model
- [ ] Form validation integration
- [ ] Accessibility improvements
- [ ] Performance optimizations (memoization, virtualization)
- [ ] Developer tools for debugging surfaces
- [ ] Visual surface builder for agents
- [ ] A/B testing support
- [ ] Analytics integration

## Support

For issues or questions:
- Check Rollbar logs for errors
- Review Supabase realtime logs
- Consult this documentation
- Contact the development team
