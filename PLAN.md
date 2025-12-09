# POC Plan: D&D Adventure League Player Management System

## Project Overview
A Nuxt 3 application for tracking D&D Adventure League players, their characters, loot vouchers, attendance, and gold. The POC will focus on UI/UX with local storage/Pinia for data persistence, with the architecture prepared for future Supabase integration.

## Technology Stack
- **Frontend**: Nuxt 3 (Vue 3, TypeScript)
- **State Management**: Pinia
- **Styling**: TailwindCSS + DaisyUI (or similar component library for rapid UI development)
- **Icons**: @nuxt/icon or heroicons
- **Future Backend**: Supabase (auth + PostgreSQL + generated API)
- **Future ORM**: Drizzle ORM for migrations

## User Roles & Permissions
1. **Player**: Create/manage own character sheets, view loot vouchers, view attendance
2. **DM**: Award attendance tokens and loot vouchers to players
3. **Admin**: Create DMs, manage all players, full system access

## Core Data Models

### User
- id, email, password (auth)
- role: 'player' | 'dm' | 'admin'
- name
- createdAt

### Character
- id, playerId (user), name
- classes: Array<{ class: string, level: number }>
- totalLevel (computed)
- race, background
- characterSource: 'manual' | 'dndbeyond' | 'pdf'
- dndBeyondLink?: string
- pdfUrl?: string
- gold: number
- createdAt, updatedAt

### LootVoucher
- id, characterId
- name, description
- rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'
- isUsed: boolean
- awardedBy (dmId)
- awardedAt, usedAt

### AttendanceToken
- id, characterId
- sessionName, sessionDate
- awardedBy (dmId)
- awardedAt

## Application Structure

```
via_AL_tracker/
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── .env.example
├── app.vue
├── pages/
│   ├── index.vue                    # Landing/dashboard
│   ├── login.vue                    # Auth page
│   ├── characters/
│   │   ├── index.vue                # Character list
│   │   ├── [id].vue                 # Character detail/sheet
│   │   └── new.vue                  # Create character
│   ├── players/
│   │   └── index.vue                # Player management (admin)
│   ├── dm/
│   │   └── award.vue                # DM award interface
│   └── admin/
│       └── index.vue                # Admin panel
├── components/
│   ├── character/
│   │   ├── CharacterCard.vue
│   │   ├── CharacterSheet.vue
│   │   ├── CharacterForm.vue
│   │   └── ClassLevelInput.vue
│   ├── loot/
│   │   ├── LootVoucherCard.vue
│   │   ├── LootVoucherList.vue
│   │   └── LootVoucherForm.vue
│   ├── attendance/
│   │   └── AttendanceList.vue
│   ├── dm/
│   │   └── AwardPanel.vue
│   └── layout/
│       ├── NavBar.vue
│       └── UserMenu.vue
├── composables/
│   ├── useAuth.ts                   # Auth state/helpers
│   ├── useCharacters.ts             # Character CRUD
│   ├── useLootVouchers.ts           # Loot voucher management
│   └── useAttendance.ts             # Attendance tracking
├── stores/
│   ├── auth.ts                      # Pinia auth store
│   ├── characters.ts                # Character data store
│   ├── lootVouchers.ts              # Loot voucher store
│   └── attendance.ts                # Attendance store
├── middleware/
│   ├── auth.ts                      # Route protection
│   ├── player.ts                    # Player-only routes
│   ├── dm.ts                        # DM-only routes
│   └── admin.ts                     # Admin-only routes
├── utils/
│   ├── fixtures.ts                  # Mock data generator
│   ├── storage.ts                   # LocalStorage wrapper
│   └── validators.ts                # Form validation helpers
├── types/
│   └── index.ts                     # TypeScript types/interfaces
└── public/
    └── sample-character.pdf         # Sample PDF for testing
```

## Implementation Phases

### Phase 1: Project Setup
- Initialize Nuxt 3 project with TypeScript
- Install dependencies: Pinia, TailwindCSS, DaisyUI, @nuxt/icon
- Configure TypeScript, Tailwind, and Nuxt modules
- Set up Pinia stores structure
- Create base layout with navigation

### Phase 2: Mock Data & Fixtures
- Create TypeScript types/interfaces for all models
- Build fixture generator with sample users (admin, dm, players)
- Generate sample characters with various classes/levels
- Create sample loot vouchers and attendance records
- Implement localStorage persistence layer

### Phase 3: Authentication & Authorization
- Build login page UI
- Implement Pinia auth store with mock authentication
- Create auth composable with login/logout/currentUser
- Set up route middleware for role-based access
- Add user menu component with role display

### Phase 4: Character Management (Player View)
- Character list page with grid/list view
- Character detail page showing full sheet
- Character creation form with:
  - Basic info (name, race, background)
  - Multi-class support (add/remove classes with levels)
  - Character source selector (manual/D&D Beyond/PDF)
  - D&D Beyond link input
  - PDF upload placeholder
- Edit character functionality
- Gold tracking display
- Loot voucher list on character detail
- Attendance history on character detail

### Phase 5: Loot & Attendance Tracking
- Loot voucher components:
  - Card display with rarity badges
  - List view with filters (unused/used, rarity)
  - Mark as used functionality
- Attendance token display:
  - Session list with dates
  - Total attendance counter

### Phase 6: DM Interface
- DM award panel:
  - Player/character selector
  - Award attendance token form (session name, date)
  - Award loot voucher form (name, description, rarity)
  - Recent awards history
- Quick search for characters
- Bulk award functionality (award to multiple characters)

### Phase 7: Admin Interface
- User management table:
  - List all users with roles
  - Promote user to DM
  - Create new users
  - Delete users (soft delete)
- Player statistics dashboard:
  - Total players/characters
  - Most active players
  - Recent activity feed
- Character overview (all characters system-wide)

### Phase 8: UI/UX Polish
- Responsive design for mobile/tablet
- Loading states and transitions
- Empty states with helpful messages
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Search and filter functionality
- Pagination for large lists
- Dark mode support (optional)

## Key UI/UX Considerations

### Dashboard (Landing Page)
- **Player View**: My characters grid, recent loot, upcoming sessions
- **DM View**: Quick award panel, recent activity, player search
- **Admin View**: System stats, user management quick actions

### Character Sheet Design
- Inspired by D&D Beyond layout but simplified
- Quick stats at top (name, race, classes/levels, total level)
- Tabbed interface: Overview | Loot Vouchers | Attendance | Edit
- Visual indicators for loot rarity (color-coded)
- Gold display prominently

### Mobile Considerations
- Bottom navigation for key actions
- Swipeable character cards
- Collapsible sections
- Touch-friendly action buttons

## Mock Authentication Users (Fixtures)
```javascript
{
  admin: { email: 'admin@al.local', password: 'admin123', role: 'admin', name: 'Admin User' },
  dm: { email: 'dm@al.local', password: 'dm123', role: 'dm', name: 'Dungeon Master' },
  player1: { email: 'player1@al.local', password: 'player123', role: 'player', name: 'Alice Player' },
  player2: { email: 'player2@al.local', password: 'player123', role: 'player', name: 'Bob Player' }
}
```

## Sample Characters (Fixtures)
- Fighter 5
- Wizard 3 / Cleric 2 (multiclass example)
- Rogue 8
- Paladin 4
- Bard 6 / Warlock 1 (multiclass example)

Each with 2-3 loot vouchers (mix of used/unused, various rarities) and 3-5 attendance tokens.

## Future Supabase Integration Notes
- All Pinia stores will be adapted to call Supabase API
- Auth store will use Supabase Auth (supabase.auth.signInWithPassword)
- Character/loot/attendance stores will use generated Supabase client
- Drizzle migrations will define PostgreSQL schema
- Row Level Security policies for user data isolation
- Real-time subscriptions for live updates (optional enhancement)

## Dependencies to Install
```json
{
  "nuxt": "^3.13.0",
  "@pinia/nuxt": "^0.5.0",
  "pinia": "^2.2.0",
  "@nuxtjs/tailwindcss": "^6.12.0",
  "daisyui": "^4.12.0",
  "@nuxt/icon": "^1.5.0",
  "typescript": "^5.6.0",
  "vue-tsc": "^2.1.0"
}
```

## Success Criteria for POC
- ✅ All three user roles can log in
- ✅ Players can view and create characters
- ✅ Multi-class support works correctly
- ✅ DMs can award loot vouchers and attendance tokens
- ✅ Admins can manage users and promote to DM
- ✅ Data persists across browser refresh (localStorage)
- ✅ UI is clean, intuitive, and responsive
- ✅ All fixtures load automatically on first run
- ✅ Navigation is role-appropriate (players don't see admin menu)

## Critical Implementation Details

### LocalStorage Schema
- Key prefix: `al_tracker_`
- Keys: `users`, `characters`, `lootVouchers`, `attendanceTokens`, `currentUser`
- JSON stringify/parse for all data
- Auto-populate on first load if empty

### Class/Level Structure
```typescript
interface ClassLevel {
  class: string; // "Fighter", "Wizard", etc.
  level: number;
}
```
Total level computed as sum of all class levels.

### Role-Based Middleware
- Check `currentUser.role` in localStorage
- Redirect unauthorized users to login or dashboard
- Hide/show UI elements based on role

### Form Validation
- Required fields: character name, at least one class
- Level must be 1-20 per class
- Total level max 20
- Email format validation
- Gold must be non-negative

## Files to Create (Priority Order)
1. `package.json` - Dependencies
2. `nuxt.config.ts` - Nuxt configuration
3. `tailwind.config.js` - Tailwind + DaisyUI
4. `types/index.ts` - All TypeScript interfaces
5. `utils/fixtures.ts` - Mock data generator
6. `utils/storage.ts` - LocalStorage wrapper
7. `stores/auth.ts` - Auth store
8. `stores/characters.ts` - Character store
9. `app.vue` - Root layout
10. `pages/login.vue` - Login page
11. `pages/index.vue` - Dashboard
12. `pages/characters/index.vue` - Character list
13. ... (continue with remaining pages and components)

## Open Questions
None currently - proceeding with standard POC approach focusing on UI/UX with fixture data.
