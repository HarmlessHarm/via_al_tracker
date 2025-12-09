# D&D Adventure League Player Management System - POC

A proof-of-concept Nuxt 3 application for tracking D&D Adventure League players, their characters, loot vouchers, attendance tokens, and gold.

## Features

### User Roles
- **Player**: Create and manage own characters, view loot vouchers and attendance
- **DM**: Award loot vouchers and attendance tokens to any player
- **Admin**: Full system access, user management, promote users to DM

### Core Functionality
- ✅ Character creation with multiclass support
- ✅ Loot voucher tracking with rarity levels
- ✅ Attendance token management
- ✅ Gold tracking per character
- ✅ D&D Beyond and PDF character sheet linking
- ✅ Role-based access control
- ✅ Responsive UI with TailwindCSS + DaisyUI

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3001/
```

## Test Users

The application comes with pre-populated fixture data for testing:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@al.local | admin123 | Full system access |
| DM | dm@al.local | dm123 | Can award loot/attendance |
| Player 1 | player1@al.local | player123 | Has 2 characters |
| Player 2 | player2@al.local | player123 | Has 2 characters |
| Player 3 | player3@al.local | player123 | Has 2 characters |

## Application Structure

```
via_AL_tracker/
├── pages/              # Nuxt pages (auto-routed)
│   ├── login.vue       # Login page
│   ├── index.vue       # Dashboard (role-based)
│   ├── characters/     # Character management
│   ├── dm/             # DM tools
│   └── admin/          # Admin panel
├── components/         # Vue components
│   ├── character/      # Character-related components
│   ├── layout/         # Navigation & layout
│   ├── loot/           # Loot voucher components
│   └── attendance/     # Attendance components
├── stores/             # Pinia state management
│   ├── auth.ts         # Authentication
│   ├── characters.ts   # Character data
│   ├── lootVouchers.ts # Loot vouchers
│   └── attendance.ts   # Attendance tokens
├── composables/        # Reusable logic
├── middleware/         # Route protection
├── utils/              # Utilities & fixtures
└── types/              # TypeScript definitions
```

## Data Persistence

Currently uses **localStorage** for data persistence (POC only). All data is stored with the `al_tracker_` prefix:

- `al_tracker_users` - User accounts
- `al_tracker_characters` - Character data
- `al_tracker_lootVouchers` - Loot vouchers
- `al_tracker_attendanceTokens` - Attendance records
- `al_tracker_currentUser` - Session data

To reset data: Clear browser localStorage and refresh the page.

## Workflow Examples

### Player Workflow
1. Login with player credentials
2. View dashboard showing your characters
3. Create a new character with multiclass support
4. View character sheet with loot and attendance
5. Mark loot vouchers as used

### DM Workflow
1. Login with DM credentials
2. Access DM Award Panel
3. Search for characters by name or player
4. Award loot vouchers with rarity levels
5. Award attendance tokens to multiple characters at once
6. View recent awards

### Admin Workflow
1. Login with admin credentials
2. View system statistics on admin dashboard
3. Manage users (promote to DM, delete users)
4. View all characters and activity
5. Access DM tools for awarding loot/attendance

## Key Features Detail

### Multiclass Support
Characters can have up to 3 classes with individual levels. Total level is automatically calculated and capped at 20.

Example: Wizard 3 / Cleric 2 = Total Level 5

### Loot Rarity System
- Common (white)
- Uncommon (green)
- Rare (blue)
- Very Rare (purple)
- Legendary (gold)

### Character Sources
- **Manual**: Data entered directly in app
- **D&D Beyond**: Link to D&D Beyond character sheet
- **PDF**: Upload PDF character sheet (placeholder in POC)

## Future Enhancements (Supabase Integration)

The architecture is designed for easy migration to Supabase:

1. Replace localStorage with Supabase PostgreSQL
2. Use Supabase Auth for authentication
3. Implement Drizzle ORM for migrations
4. Add Row Level Security policies
5. Optional: Real-time subscriptions

## Technology Stack

- **Frontend**: Nuxt 3 (Vue 3 + TypeScript)
- **State Management**: Pinia
- **Styling**: TailwindCSS + DaisyUI
- **Icons**: @nuxt/icon
- **Data**: localStorage (POC), future Supabase

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed development information and architecture documentation.

See [PLAN.md](./PLAN.md) for the complete implementation plan.

## License

MIT - POC for D&D Adventure League Management

---

**Note**: This is a proof-of-concept focused on UI/UX. Production deployment would require:
- Real authentication (currently uses plain-text passwords)
- Server-side validation
- Database backend (Supabase recommended)
- Proper security measures
- Backup and recovery
