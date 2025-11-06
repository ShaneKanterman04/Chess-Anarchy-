# ♟️ Chess Anarchy

### CSC 330 — Software Design and Development  
**Team Members:** Ivory, Shane, Oscar, Peter  

---

## 🧠 Project Overview

**Chess Anarchy** is an experimental web-based chess platform designed to make classic chess *chaotic, customizable, and fun*.  
The application introduces an **Admin role** that can alter traditional chess rules, control game flow, and even manipulate player outcomes — creating an unpredictable and engaging environment for both players and spectators.

---

## 🎯 Project Goals

- Provide a working chess game for **two players** with **live spectators**.  
- Implement **Admin controls** for managing rules, match conditions, and outcomes.  
- Store user data (wins, losses, and roles) securely using **Supabase**.  
- Deliver an enjoyable classroom demonstration emphasizing software design principles.

---

## 👥 User Roles and Capabilities

| Role | Capabilities |
|------|---------------|
| **Admin** | Create matches, define custom rules, assign wins/losses, set timers, ban users |
| **Player** | Join and play in matches, make valid chess moves, compete to win |
| **Spectator** | Watch live matches, post comments, and engage with other viewers |

---

## 📚 User Stories

- *As an admin,* I should be able to give players wins or losses and select who competes.  
- *As an admin,* I should be able to change chess rules to alter how the game is played.  
- *As a player,* I want to play against other players to win and search for new matches.  
- *As a spectator,* I want to comment on games to socialize and react live.

---

## ⚙️ System Architecture

The system follows a simple modular design:
- **User Management Module** — Handles authentication and role assignment (admin/player/spectator).  
- **Game Logic Module** — Maintains chess rules, custom variations, and real-time board updates.  
- **Admin Control Module** — Allows admins to modify rules, choose players, and control the game.  
- **Spectator Module** — Displays the live game state and handles chat input.  
- **Database Layer (Supabase)** — Stores user info, matches, and admin-defined settings.

📘 *See structure diagram and Lucidchart reference:*  
[Lucidchart Diagram](https://lucid.app/lucidchart/b9101597-4cdd-4d94-b775-6aefb0468d84/edit?crop=content&page=0&signature=cdb839b70f0fb4989bbcbea5bfed7cdf47d62a6264ff54f501e67ed035e04526)

---

## 🧩 Technology Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Node.js (Express.js) |
| **Database & Auth** | Supabase |
| **Hosting** | Google Cloud |
| **Version Control** | GitHub |

---

## 🔒 Non-Functional Specifications

### Platform & Stack
- Web-based Node.js application hosted on **Google Cloud**  
- **Supabase** handles user sign-ups, authentication, and record storage

### Performance
- Supports up to **10 concurrent users** (2 players, 1 admin, multiple spectators)  
- Real-time move updates and chat responses within **< 1 second**

### Security
- All communication uses **HTTPS**  
- Supabase authentication secures passwords and sessions  
- Admin actions are limited to approved users

### Usability
- Clear and simple interface with labeled role-based controls  
- Designed for **classroom demonstration clarity** and accessibility

### Reliability & Maintenance
- Target **95% uptime** for demos  
- Code managed on **GitHub** with modular structure for easy updates  
- Database backups performed manually before test phases

---

## 🧠 Future Improvements

- Add WebSocket-based real-time multiplayer support  
- Implement visual chessboard with drag-and-drop piece movement  
- Expand Admin customization options (e.g., custom piece types, random boards)  
- Integrate spectator reactions or voting features

---

## 🚀 Local Server

```bash
npm install
npm start
```

Then visit `http://localhost:3000` to open the lightweight front end. The Node server at `server.js` keeps a shared chess board in memory, lets any connected user move pieces with Socket.IO events, and broadcasts the updated state and in-game chat to everyone in the game.

---

## 🧾 License

This project is developed as part of **CSC 330 – Software Design and Development** at *Southern Connecticut State University (SCSU)*.  
It is intended for educational and non-commercial use.

---

## 💬 Contact

For questions or contributions:  
**Team Members:** Ivory • Shane • Oscar • Peter  

---
