# Chess Anarchy – AI Coding Instructions

## Project Overview
Chess Anarchy is a real-time multiplayer chess platform with role-based permissions (Admin, Player, Spectator). The app uses **Socket.IO for real-time sync** with no chess rule enforcement—it's "anarchy" by design. All game state lives in server memory (not persistent).

## Architecture

### Server (`server.js`)
- **Express + Socket.IO** server on port 3000
- **In-memory state**: `game` object holds `board` (8×8 array), `moves[]`, and `chat[]`
- **No validation**: moves are accepted as-is with basic bounds checking only
- Users tracked in `users` Map by socket ID
- Route `/` serves `public/pre-index.html` (role selection landing page)

### Client (`public/main.js`)
- **Role-based UI**: reads `?role=player` or `?role=spectator` from URL query params
- **Player**: can click pieces to move, chat disabled
- **Spectator**: read-only board view, chat enabled
- Board rendered as 8×8 grid of `<button>` elements with `data-row` and `data-col` attributes
- Two-click move pattern: select piece → select destination → emits `move` event

### Socket.IO Events
| Event | Direction | Purpose |
|-------|-----------|---------|
| `init` | Server→Client | Initial state sync (board, users, moves, chat) |
| `move` | Client→Server | Send move with `{from, to, piece}` |
| `move` | Server→Clients | Broadcast updated board and move log |
| `chat-message` | Both ways | Chat messages (spectators only) |
| `reset` | Both ways | Clear board/chat, return to starting position |
| `user-joined` / `user-left` | Server→Clients | User list updates |

## Key Patterns

### Piece Encoding
- String codes: `'wp'` (white pawn), `'bk'` (black king), etc.
- Format: `[color][type]` where color is `w`/`b` and type is `p`/r/n/b/q/k`
- `pieceLabels` object in `main.js` maps codes to display strings like `'wP'`, `'bR'`

### Board State Management
- Server: `game.board` is 2D array (row-major, 0-indexed)
- Client: local `state.board` synced via Socket.IO events
- Move updates are **broadcast to all clients** immediately after mutating server board
- No turn validation or move legality checks—"anarchy" chess

### Role Differentiation
- Determined by URL param: `index.html?role=player` vs `?role=spectator`
- Players: `handleCellClick()` enabled, chat input disabled in `main.js` line 138
- Spectators: board clicks ignored (early return in `handleCellClick`), chat enabled
- Admin role planned but not yet implemented (see README future work)

## Development Workflow

### Running Locally
```bash
npm install
npm start  # Starts server on http://localhost:3000
```

### File Structure
- `server.js` – Backend logic (Socket.IO + Express)
- `public/pre-index.html` – Landing page with role selection buttons
- `public/index.html` – Main game UI (board, chat, move log)
- `public/main.js` – Client-side Socket.IO handling and DOM updates
- `public/styles.css` – Dark mode chess UI with grid layout
- No build step or transpilation required

### Testing Multi-User Flow
1. Open `http://localhost:3000` in multiple browser tabs/windows
2. Select different roles (player/spectator) on landing page
3. Each connection gets unique socket ID and appears in "Users" sidebar
4. Players can move pieces; spectators see moves in real-time

## Common Tasks

### Adding a New Socket Event
1. Define handler in `server.js` inside `io.on('connection', ...)` block
2. Add corresponding `socket.on()` listener in `public/main.js`
3. Update `state` object and trigger relevant render function

### Modifying Board Rendering
- Edit `renderBoard()` in `main.js` (lines 72–93)
- Board cells are `<button>` elements with `.light`/`.dark` classes for checkerboard
- Selected piece highlighted with `.selected` class

### Implementing Chess Rules
- Add validation in server's `move` event handler before mutating `game.board`
- Current code accepts any `from`/`to` coordinates if on board (lines 61–66 in `server.js`)
- Consider tracking turn state and piece-specific move patterns

## Known Limitations
- **No persistence**: restarting server clears all games
- **No admin controls**: planned role not yet implemented
- **Single game instance**: all users share one board (no rooms/sessions)
- **No Supabase integration**: mentioned in README but not in code
- **No move validation**: any piece can move anywhere (intentional for now)

## Dependencies
- `express` ^4.19.2 – HTTP server and static file serving
- `socket.io` ^4.7.5 – Real-time bidirectional communication
- No frontend frameworks or build tools

## Styling Conventions
- CSS variables in `:root` for theming (dark mode by default)
- Grid layouts for board (8×8) and main layout (board + sidebar)
- Color palette: dark backgrounds (`#0f172a`), cyan accents (`#0ea5e9`)
- Board squares: `#f0d9b5` (light) and `#b58863` (dark) following chess.com style
