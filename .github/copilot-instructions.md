# Chess Anarchy – AI Coding Instructions

## Project Overview
Chess Anarchy is a real-time multiplayer chess platform. Despite the name, it now enforces **standard chess rules**, turn-based play, and timers. It uses **Node.js/Express/Socket.IO** for the backend and **MySQL** for user/match persistence.

## Architecture

### Server (`server.js`)
- **Express**: Serves static files and handles Auth (`/signup`, `/login`) via form POSTs.
- **Socket.IO**: Handles real-time game state, chat, and match listing.
- **MySQL**: Connects to Google Cloud SQL for `user` and `gamematch` tables.
- **In-Memory State**:
  - `game`: Holds `board` (8x8), `moves`, `chat`, `capturedWhite`, `capturedBlack`.
  - `match`: Tracks `players` (white/black socket IDs) and `turn` ('w'/'b').
  - `users`: Map of socket ID to user info.

### Client Structure
- **Game UI**: `public/index.html` + `public/main.js` (Game board, chat).
- **Auth**: `public/login.html`, `public/sign-up.html` (Form submissions).
- **Match Listing**: `public/matchSearch.html` + `public/matches.js` (Socket.IO `requestMatchData`).
- **Landing**: `public/pre-index.html` (Role selection).

## Key Patterns & Conventions

### Game Logic & Validation
- **Server-Side Validation**: `isValidMove()` in `server.js` enforces rules (geometry, path clearing, turn order).
- **Turn Management**: `match.turn` toggles 'w'/'b'. Moves out of turn are rejected.
- **Timer**: Server-side interval (`timerOnWhenPlayersJoin`) broadcasts `Timer:` events. Resets on valid move.
- **Win Condition**: King capture triggers `endGameHandler`.

### Data Flow
- **Auth**: Standard HTTP POST to `/login` or `/signup`. Redirects to `pre-index.html` on success.
- **Game Sync**:
  - `init`: Sends full state on join.
  - `move`: Broadcasts updates.
  - `invalid-move`: Sent to sender if validation fails.
  - `Timer:` / `Turn:`: Broadcasts time/turn updates.

### Database
- **Library**: `mysql2` with connection pooling.
- **Credentials**: Hardcoded in `server.js` and `database.js` (Team5/Team05!!).
- **Queries**: Raw SQL strings (e.g., `SELECT * FROM user...`).

### Piece Encoding
- Format: `[color][type]` (e.g., `'wp'`, `'bk'`).
- Color: `w` (White), `b` (Black).
- Type: `p` (Pawn), `r` (Rook), `n` (Knight), `b` (Bishop), `q` (Queen), `k` (King).

## Development Workflow

### Running Locally
```bash
npm install
npm start  # Server on http://localhost:3000
```

### Common Tasks

**Adding a New Rule**
1. Update `isValidMove` or specific piece validator (e.g., `isValidPawnMove`) in `server.js`.
2. Ensure `invalid-move` event is emitted if rule is violated.

**Modifying Database**
1. Use `db.query()` in `server.js`.
2. Note: `database.js` exists but `server.js` initializes its own pool. Check which one is being used for the context.

**Debugging**
- Server logs: `console.log` in `server.js` for auth/connection events.
- Client logs: Browser console for Socket.IO events.

## Known Limitations
- **Single Game Instance**: The server currently supports only **one active game** in memory (`game` object), shared by all connected users.
- **Hardcoded Config**: DB credentials and IP are hardcoded.
## Styling Conventions
- CSS variables in `:root` for theming (dark mode by default)
- Grid layouts for board (8×8) and main layout (board + sidebar)
- Color palette: dark backgrounds (`#0f172a`), cyan accents (`#0ea5e9`)
- Board squares: `#f0d9b5` (light) and `#b58863` (dark) following chess.com style
