# [Frontend-Web] Dashboard Layout & Navigation

## Overview
Implement the main dashboard layout with sidebar navigation, header, and responsive design for the TherapyFlow web application.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/9205213b-7551-4266-99b1-915e78111a8d` (Frontend Web Implementation - Dashboard Section)

The dashboard is the central hub where therapists access all features: patient management, sessions, billing, and settings.

## Dashboard Layout

```wireframe
┌────────────────────────────────────────────────────────────┐
│ ┌──────────┐  TherapyFlow        [🔔] [👤 Dr. Priya ▼]   │
│ │   LOGO   │                                               │
│ └──────────┘                                               │
├────────────────────────────────────────────────────────────┤
│ │          │                                               │
│ │ 📊 Dash  │  ┌─────────────────────────────────────────┐ │
│ │          │  │                                         │ │
│ │ 👥 Patie │  │                                         │ │
│ │          │  │                                         │ │
│ │ 📅 Sessi │  │         Main Content Area               │ │
│ │          │  │                                         │ │
│ │ 🎙️ Recor │  │                                         │ │
│ │          │  │                                         │ │
│ │ 💰 Billi │  │                                         │ │
│ │          │  │                                         │ │
│ │ ⚙️ Setti │  └─────────────────────────────────────────┘ │
│ │          │                                               │
│ └──────────┘                                               │
└────────────────────────────────────────────────────────────┘
```

## Technical Requirements

### 1. Layout Component (`app/(dashboard)/layout.tsx`)
```typescript
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 2. Sidebar Component
```wireframe
┌──────────────────┐
│  TherapyFlow     │
│                  │
│ 📊 Dashboard     │
│ 👥 Patients      │
│ 📅 Sessions      │
│ 🎙️ Record        │
│ 💰 Billing       │
│ 📊 Analytics     │
│ ⚙️ Settings      │
│                  │
│ ─────────────    │
│                  │
│ 🆘 Help          │
│ 📚 Resources     │
└──────────────────┘
```

**Features:**
- Active route highlighting
- Collapsible on mobile
- Smooth transitions
- Icon + text labels
- Badge for notifications (e.g., pending approvals)

### 3. Header Component
```wireframe
┌────────────────────────────────────────────────┐
│  TherapyFlow          [🔔 3]  [👤 Dr. Priya ▼] │
└────────────────────────────────────────────────┘
```

**Features:**
- Organization name/logo
- Notification bell with count
- User profile dropdown
  - View Profile
  - Settings
  - Help & Support
  - Sign Out
- Search bar (future enhancement)

### 4. Navigation Items
```typescript
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
    badge: null
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: Calendar,
    badge: 2 // Upcoming today
  },
  {
    name: 'Record',
    href: '/record',
    icon: Mic,
    badge: null
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    badge: null
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart,
    badge: null
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null
  }
];
```

### 5. Responsive Behavior
**Desktop (> 1024px):**
- Sidebar always visible (240px width)
- Full navigation labels

**Tablet (768px - 1024px):**
- Collapsible sidebar
- Hamburger menu button in header

**Mobile (< 768px):**
- Sidebar hidden by default
- Overlay sidebar when opened
- Bottom navigation bar (alternative)

### 6. Mobile Bottom Navigation (Alternative)
```wireframe
┌────────────────────────────────────────────────┐
│                                                │
│            Main Content Area                   │
│                                                │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│  📊      👥      🎙️      📅      ⚙️           │
│  Home  Patients Record Sessions  More          │
└────────────────────────────────────────────────┘
```

### 7. State Management
Use Zustand for UI state:
```typescript
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false })
}));
```

### 8. Notification System
Implement notification dropdown:
- Real-time updates via Supabase Realtime
- Mark as read functionality
- Navigate to relevant page on click
- Types: session reminders, AI note ready, payment received

## Acceptance Criteria
- [ ] Dashboard layout implemented with sidebar and header
- [ ] Sidebar navigation working with active state
- [ ] Header with user dropdown implemented
- [ ] Notification bell with count working
- [ ] Responsive design working on all screen sizes
- [ ] Mobile sidebar overlay working
- [ ] Smooth transitions and animations
- [ ] Active route highlighting working
- [ ] User dropdown menu working
- [ ] Sign out functionality working
- [ ] Notification dropdown implemented
- [ ] Real-time notification updates working
- [ ] Keyboard navigation support
- [ ] Accessibility (ARIA labels, focus management)

## Dependencies
- Requires: Next.js Web App Setup
- Requires: Authentication Pages Implementation

## Estimated Effort
8-10 hours