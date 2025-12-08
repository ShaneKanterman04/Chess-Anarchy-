# Chess-Anarchy AI Coding Instructions

## Project Overview
This is a real-time multiplayer chess application built with **Node.js**, **Express**, **Socket.io**, and **MySQL/MariaDB**. The application features server-side move validation, database-driven movement rules, and a vanilla JavaScript frontend.

## Architecture & Core Components

### Backend (`server.js`)
- **Entry Point:** Handles HTTP requests and Socket.io connections.
- **Game State:** In-memory `match` object tracks players and turn. `baseBoard` defines the initial state.
- **Move Validation:** `isValidMoveDB` validates moves against rules loaded from the database.
- **Database Integration:** 
  - Uses `mariadb` for loading game rules (`loadMovementRules`).
  - Uses `mysql2` for initial connection checks.
  - **Note:** Database credentials and host IPs are currently hardcoded.

### Frontend (`public/`)
- **`main.js`:** Handles UI rendering, user input, and Socket.io communication.
- **`matches.js`:** Likely handles match listing/searching logic.
- **Rendering:** DOM manipulation is used to render the board and pieces.
- **State:** Client maintains a local `state` object synced via socket events.

### Database (`chess_schema.sql`)
- **Schema:** Defines tables for `admin`, `custom_rules`, `user`, etc.
- **Rules:** Movement rules (horizontal, vertical, diagonal capabilities) are stored in the `rules` table and cached in memory (`movementCache`) on server start.

## Data Structures & Conventions

### Board Representation
- **Grid:** 8x8 Array of Arrays.
- **Pieces:** 2-character strings:
  - Color: `w` (White), `b` (Black).
  - Type: `p` (Pawn), `r` (Rook), `n` (Knight), `b` (Bishop), `q` (Queen), `k` (King).
  - Example: `'wp'` (White Pawn), `'bk'` (Black King), `null` (Empty square).

### Coordinates
- **Format:** Objects with `row` (0-7) and `col` (0-7) properties.
- **Example:** `{ row: 6, col: 4 }`.

### Communication
- **Socket.io:** Used for all real-time game events (`move`, `join`, `disconnect`).
- **Roles:** Clients connect with a `role` query parameter (`white`, `black`, or `spectator`).

## Critical Workflows

### Running the Server
```bash
npm start
# Runs: node server.js
# Server listens on port 3000 (or process.env.PORT)
```

### Database Access
- **Connection:** The application connects to a remote MariaDB instance (IP: `34.74.157.230`).
- **Pattern:** Use `pool.getConnection()` for queries and ensure `conn.release()` is called in a `finally` block.

## Development Guidelines
- **Move Validation:** When modifying game logic, ensure changes are reflected in `isValidMoveDB` in `server.js`.
- **Frontend Updates:** UI changes should be made in `public/index.html` and `public/main.js`.
- **Security:** Be aware of hardcoded credentials. Do not expose sensitive information in logs or client-side code.
