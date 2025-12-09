# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a D&D Adventure League player management system POC built with Nuxt 3. The application tracks characters, loot vouchers, attendance tokens, and gold for Adventure League players. Currently uses localStorage and Pinia for data persistence, with architecture designed for future Supabase integration.

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
```

### Development
```bash
npm run dev                    # Start dev server (http://localhost:3000 or 3001)
npm run build                  # Build for production
npm run preview                # Preview production build
npm run generate               # Generate static site
```

**Note**: The dev server may use port 3001 if port 3000 is already in use. Check the terminal output for the actual port.

### Type Checking
```bash
npm run typecheck              # Run TypeScript type checking
```

## Architecture Overview

### Tech Stack
- **Framework**: Nuxt 3 (Vue 3 with TypeScript)
- **State Management**: Pinia stores
- **Styling**: TailwindCSS + DaisyUI
- **Icons**: @nuxt/icon
- **Data Persistence**: localStorage (POC), future Supabase backend

### User Roles & Access Control
Three distinct user roles with different permissions:
1. **Player** - Manage own characters, view loot/attendance
2. **DM** - Award loot vouchers and attendance tokens to any player
3. **Admin** - Full system access, user management, promote users to DM

Role-based access is enforced through:
- Nuxt middleware (`middleware/auth.ts`, `middleware/player.ts`, `middleware/dm.ts`, `middleware/admin.ts`)
- Conditional UI rendering based on `currentUser.role`
- All roles stored in `stores/auth.ts` and persisted to localStorage

### Data Models
Core entities are defined in `types/index.ts`:

**User**: Authentication and role management
- Fields: id, email, password (hashed), role, name, createdAt

**Character**: Player character sheets
- Fields: id, playerId, name, classes (array), race, background, characterSource, gold
- Classes structure: `Array<{ class: string, level: number }>` for multiclass support
- Total level is computed by summing all class levels

**LootVoucher**: Trackable loot items
- Fields: id, characterId, name, description, rarity, isUsed, awardedBy, awardedAt, usedAt
- Rarity levels: common, uncommon, rare, very_rare, legendary

**AttendanceToken**: Session attendance tracking
- Fields: id, characterId, sessionName, sessionDate, awardedBy, awardedAt

### State Management Pattern
All data is managed through Pinia stores:
- `stores/auth.ts` - Authentication state and user session
- `stores/characters.ts` - Character CRUD operations
- `stores/lootVouchers.ts` - Loot voucher management
- `stores/attendance.ts` - Attendance token tracking

Stores use `utils/storage.ts` wrapper for localStorage persistence with the `al_tracker_` prefix.

### Component Organization
Components are organized by feature domain:
- `components/character/*` - Character-related UI
- `components/loot/*` - Loot voucher components
- `components/attendance/*` - Attendance tracking UI
- `components/dm/*` - DM-specific interfaces
- `components/layout/*` - Navigation and layout components

### Composables Pattern
Reusable business logic is extracted to composables:
- `composables/useAuth.ts` - Auth helpers and current user state
- `composables/useCharacters.ts` - Character CRUD operations
- `composables/useLootVouchers.ts` - Loot management
- `composables/useAttendance.ts` - Attendance operations

Composables integrate with Pinia stores and provide cleaner API for components.

### Fixture Data System
`utils/fixtures.ts` generates mock data for development:
- Pre-defined test users (admin, dm, player1, player2)
- Sample characters with multiclass examples
- Loot vouchers of various rarities
- Attendance records

Fixtures auto-populate localStorage on first application load if data is empty.

### Mock Authentication
Current POC uses simple mock auth:
- Credentials stored in fixtures (e.g., `admin@al.local` / `admin123`)
- Password validation done in auth store
- Session persisted via localStorage `currentUser` key
- Login redirects based on role

**Future**: Replace with Supabase Auth (`supabase.auth.signInWithPassword`)

## Critical Implementation Patterns

### Multi-Class Character Support
Characters can have multiple classes with individual levels:
```typescript
classes: [
  { class: "Wizard", level: 3 },
  { class: "Cleric", level: 2 }
]
totalLevel: 5 // computed
```
Total level validation: sum of all levels ≤ 20

### Character Source Tracking
Three ways to manage character sheets:
- `manual` - Data entered directly in app
- `dndbeyond` - Link to D&D Beyond character sheet
- `pdf` - Upload PDF character sheet

### LocalStorage Schema
Keys use `al_tracker_` prefix:
- `al_tracker_users` - All user accounts
- `al_tracker_characters` - All characters
- `al_tracker_lootVouchers` - All loot vouchers
- `al_tracker_attendanceTokens` - All attendance tokens
- `al_tracker_currentUser` - Current session user

All data is JSON stringified/parsed via `utils/storage.ts`.

### Route Protection
Middleware chain for protected routes:
1. `auth.ts` - Ensures user is logged in
2. Role-specific middleware (`player.ts`, `dm.ts`, `admin.ts`) - Role validation
3. Redirect to `/login` if unauthorized

### DM Award Flow
DMs award loot/attendance through `pages/dm/award.vue`:
1. Select character (search by name or player)
2. Choose award type (loot voucher or attendance token)
3. Fill form (name, description, rarity OR session name, date)
4. Submit - creates record with `awardedBy: currentUser.id`

### Admin User Management
Admins can:
- View all users in system
- Promote players to DM role
- Create new user accounts
- Soft delete users (mark inactive, don't actually delete)

## Common Development Patterns

### Creating a New Page
1. Add `.vue` file to `pages/` (Nuxt auto-routing)
2. Add middleware if route requires auth/role: `definePageMeta({ middleware: ['auth', 'player'] })`
3. Import and use composables/stores for data
4. Use DaisyUI components for consistent styling

### Adding a New Store
1. Create store in `stores/` using `defineStore`
2. Add localStorage persistence via `utils/storage.ts`
3. Implement actions for CRUD operations
4. Create corresponding composable in `composables/` for cleaner component API

### Working with Forms
1. Use Vue `ref()` for form data
2. Validate with `utils/validators.ts` helpers
3. Call store action on submit
4. Handle errors with toast notifications (DaisyUI alerts)
5. Reset form and redirect on success

## Future Supabase Migration Path

When migrating to Supabase backend:

1. **Auth**: Replace auth store with Supabase Auth
   - `supabase.auth.signInWithPassword(email, password)`
   - Session managed by Supabase client

2. **Database**: Use Drizzle ORM for schema migrations
   - Define schema in `drizzle/schema.ts`
   - Run migrations with Drizzle CLI

3. **API Layer**: Replace localStorage with Supabase generated API
   - Update stores to call `supabase.from('table').select()`
   - Use Row Level Security for data isolation

4. **Real-time**: Optional real-time subscriptions
   - Subscribe to character/loot changes
   - Auto-update UI on DM awards

## Testing Users (Fixtures)
```
admin@al.local / admin123 (role: admin)
dm@al.local / dm123 (role: dm)
player1@al.local / player123 (role: player)
player2@al.local / player123 (role: player)
```

## Important Notes

- **LocalStorage Limitations**: 5MB limit per domain. POC data should stay well under this.
- **No Server-Side Validation**: All validation is client-side. Future backend must re-validate.
- **Character Level Cap**: Total level across all classes is capped at 20 (D&D 5e rule).
- **Loot Rarity Colors**: Follow D&D 5e item rarity color scheme (common=white, uncommon=green, rare=blue, very_rare=purple, legendary=gold).
- **Responsive Design**: Mobile-first approach with TailwindCSS breakpoints. Test on mobile viewport.
- **DaisyUI Themes**: Default theme configured in `tailwind.config.js`. Can enable dark mode via DaisyUI themes.

## File Locations Reference

- **Configuration**: `nuxt.config.ts`, `tailwind.config.js`, `tsconfig.json`
- **Types**: `types/index.ts`
- **Stores**: `stores/*.ts`
- **Composables**: `composables/*.ts`
- **Utils**: `utils/*.ts`
- **Middleware**: `middleware/*.ts`
- **Pages**: `pages/**/*.vue`
- **Components**: `components/**/*.vue`
- **Layouts**: `layouts/*.vue` (if using custom layouts)

## Troubleshooting

**Fixtures not loading?**
- Check browser console for errors
- Clear localStorage: `localStorage.clear()` in console
- Refresh page to trigger fixture initialization

**Auth not persisting?**
- Verify `al_tracker_currentUser` exists in localStorage
- Check middleware order in `nuxt.config.ts`

**Type errors?**
- Run `npm run typecheck` to see all TypeScript errors
- Ensure all imports reference `types/index.ts`

**Styling not applying?**
- Verify Tailwind/DaisyUI in `nuxt.config.ts` modules
- Check TailwindCSS JIT mode is enabled
- Restart dev server after config changes
