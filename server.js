const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mariadb = require('mariadb');

const mysql = require('mysql2');
const db = mysql.createPool({
  host     : '34.74.157.230',
  user     : 'Team5',
  password : 'Team05!!',
  database : 'chess',
  connectionLimit : 10
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Ensure JSON body parsing is enabled
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const match =  { //making match obj so we can actually have turns before putting a time limit
     players: {
       white: null,
       black: null
     },	
     turn: "w" //in classic rules white goes first
};



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public','sign-up.html'));

//The connection to MariaDB
const pool = mariadb.createPool({
  host: '34.74.157.230',
  user: 'Team5',
  password: 'Team05!!',
  database: 'chess',
  connectionLimit: 5
});

app.post('user-In-Match', (req, res) => {
  console.log(req.body);
}); //post for ajax call if working

app.post('/signup', (req,res) => {
  const sql = 'INSERT INTO user (user_ID, password) VALUES (?, ?)';
  const data = [req.body.user_ID,req.body.psw];
  db.query(sql, data, (err) => {
    if (err) {
      throw err;
    };
    console.log('New user signed up: ', req.body.user_ID);
  });
  res.redirect('/pre-index.html');
});

app.post('/login', (req,res) => {
  console.log(req.body);
  const data = [req.body.user_ID, req.body.psw];
  const sql = 'SELECT * FROM user WHERE user_ID = ? AND password = ?';
  db.query(sql, data, function (err, results, fields) {
    if (err) {
	throw err;
    }
    if (results.length > 0) {
      console.log('User: ', req.body.user_ID, 'logged in');
      res.redirect('/pre-index.html');
    }
    else {
      console.log("Login error, info doesn't match");
      res.sendFile(path.join(__dirname,'public','login.html'));
    }
  });
});


app.post('/create-match', (req, res) => {
  const { ruleset, timer } = req.body;
  // Generate a random 1-char ID for Ruleset_ID to fit in varchar(1) columns
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rulesetId = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname,'public','sign-up.html'));
 });

app.get('/already_in', (req, res) => {
  res.sendFile(path.join(__dirname,'public','login.html'));
});

app.post('/signup', (req,res) => {
  const sql = 'INSERT INTO user (user_ID, password) VALUES (?, ?)';
  const data = [req.body.user_ID,req.body.psw];
  db.query(sql, data, (err) => {
    if (err) {
      console.error("Signup DB Error:", err);
      // If duplicate entry, redirect to login or show error
      if (err.code === 'ER_DUP_ENTRY') {
          return res.redirect('/already_in?error=exists');
      }
      return res.status(500).send("Database error");
    };
    console.log('New user signed up: ', req.body.user_ID);
    res.redirect(`/pre-index.html?user=${req.body.user_ID}`);
  });
});

app.post('/login', (req,res) => {
  const data = [req.body.user_ID, req.body.psw];
  const sql = 'SELECT * FROM user WHERE user_ID = ? AND password = ?';
  db.query(sql, data, function (err, results, fields) {
    if (err) {
      console.error("Login DB Error:", err);
      return res.status(500).send("Database error");
    }
    if (results.length > 0) {
      console.log('User: ', req.body.user_ID, 'logged in');
      res.redirect(`/pre-index.html?user=${req.body.user_ID}`);
    }
    else {
      console.log("Login error, info doesn't match");
      res.sendFile(path.join(__dirname,'public','login.html'));
    }
  });
});

let movementCache = {};

function pushOrDel(data) {
  if (data.matchID == null || data.ID == null || data.role == null) {
    return;
  }
  let player1 = '';
  let player2 = '';
  const sqlSpec = 'INSERT INTO match_spectators VALUES (?, ?)';
  const sqlSpecDel = 'DELETE FROM match_spectators WHERE match_ID = ? AND spectator_ID = ?'
  const sqlCheck = 'SELECT player1_ID, player2_ID FROM gamematch WHERE match_ID = ?;';
  const sqlP1 = 'UPDATE gamematch SET player1_ID = ? WHERE match_ID = ?;';
  const sqlP2 = 'UPDATE gamematch SET player2_ID = ? WHERE match_ID = ?;';
  if (data.role == 'spectator') {
    if (data.type == 'push') {
      db.query(sqlSpec, [data.matchID, data.ID], (err) => {
        if (err) {
          // Ignore duplicate entry errors for spectators
          if (err.code !== 'ER_DUP_ENTRY') {
             console.error(err); 
          }
          return;
        }
        console.log('Spectator:', data.ID, 'logged into match:', data.matchID);
      });
    }
    else {
      db.query(sqlSpecDel, [data.matchID, data.ID], (err) => {
        if (err) {
          console.error(err); return;
        }
        console.log('Spectator:', data.ID, 'left  match:', data.matchID);
      });
    }
  }
  else {
    db.query(sqlCheck, data.matchID, function (err, results, fields) {
      if (err) {
        console.error(err); return;
      }
      if (!results || results.length === 0) {
        return;
      }
      player1 = results[0].player1_ID;
      player2 = results[0].player2_ID;
      if (player1 === null && data.type == 'push') {
        db.query(sqlP1, [data.ID, data.matchID], (err) => {
          if (err) {
            console.error(err); return;
          }
          console.log(data.ID, '(player 1) logged');
        });
      }
      else if (player2 === null && data.type == 'push') {
        db.query(sqlP2, [data.ID, data.matchID], (err) => {
          if (err) {
            console.error(err); return;
          }
          console.log(data.ID, '(player 2) logged');
        });
      }
      else if (player1 == data.ID && data.type == 'delete') {
        db.query(sqlP1, [null, data.matchID], (err) => {
          if (err) {
            console.error(err); return;
          }
          console.log(data.ID, '(player 1) left match:', data.matchID);
        });
      }
      else if (player2 == data.ID && data.type == 'delete') {
        db.query(sqlP2, [null, data.matchID], (err) => {
          if (err) {
            console.error(err); return;
          }
        console.log(data.ID, '(player 2) left match:', data.matchID);
        });
      }
      else {
        console.log('player spots full');
      }
    });
  }
}
//loading in the gamemode and piec movements
async function loadMovementRules(rulesetID) {
  let conn;
  try {
    conn = await pool.getConnection(); //grabs the database
    const rows = await conn.query(
      'SELECT piece_type, horizontal, vertical, diagonal FROM rules  WHERE Ruleset_ID = ?',
      [rulesetID]
    );
    
    // Initialize cache for this ruleset if it doesn't exist
    if (!movementCache[rulesetID]) {
      movementCache[rulesetID] = {};
    }

    rows.forEach(row => {
      movementCache[rulesetID][row.piece_type] = {
        horizontal: row.horizontal,
        vertical: row.vertical,
        diagonal: row.diagonal
      }; //adds piece rules to cache
    });
  });
});
app.use(express.static('public'));
    console.log(`Movement rules loaded for ruleset ${rulesetID}:`, movementCache[rulesetID]); //prints the movement rules
  } finally {
    if (conn) conn.release();
  }
}

//grabbing the piece type
function getPieceMovement(pieceType, rulesetID) {
  if (!movementCache[rulesetID]) return null;
  return movementCache[rulesetID][pieceType] || null;
}

// Load rules at startup - removed as we load on demand now
// loadMovementRules().catch(err => console.error('Failed to load movement rules:', err));


const baseBoard = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
];

function freshBoard() {
  return baseBoard.map(row => row.slice());
}

function isOnBoard(value) {
  return Number.isInteger(value) && value >= 0 && value < 8;
}

function getPieceColor(piece) {
  return piece ? piece[0] : null;
}

function getPieceType(piece) {
  return piece ? piece[1] : null;
}


function isPathClear(board, from, to) {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;

  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) return false;
    currentRow += rowStep;
    currentCol += colStep;
  }
  return true;
}

//new db movement code
async function isValidMoveDB(board, from, to, piece, rulesetID) {
  if (!piece) return false;

  const color = getPieceColor(piece);
  const typeMap = { p: 'Pawn', r: 'Rook', n: 'Knight', b: 'Bishop', q: 'Queen', k: 'King' };
  const type = typeMap[getPieceType(piece)];
  let moveData = await getPieceMovement(type, rulesetID);
  
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  const target = board[to.row][to.col];

   if (target && target[0] === color) return false;
	

   //piece logic

   if (type === 'Pawn') {
   const direction = color === 'w' ? -1 : 1;
   const startRow = color === 'w' ? 6 : 1;

    if (colDiff === 0 && rowDiff === direction && !target) return true;
    
    if (colDiff === 0 && rowDiff === 2 * direction && from.row === startRow &&
        !target && !board[from.row + direction][from.col]) return true;

    if (Math.abs(colDiff) === 1 && rowDiff === direction && target && target[0] !== color) return true;

    return false;
  }

  if (type === 'Knight') {
    return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
           (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
  }

  if (type === 'King') {
    return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
  }

  if (!moveData) {
      // Fallback defaults for sliding pieces if no rules defined
      if (type === 'Rook') moveData = { horizontal: 7, vertical: 7, diagonal: 0 };
      else if (type === 'Bishop') moveData = { horizontal: 0, vertical: 0, diagonal: 7 };
      else if (type === 'Queen') moveData = { horizontal: 7, vertical: 7, diagonal: 7 };
      else return false;
  }

  if (rowDiff === 0 && Math.abs(colDiff) <= moveData.horizontal) {
    return isPathClear(board, from, to);
  }

  if (colDiff === 0 && Math.abs(rowDiff) <= moveData.vertical) {
    return isPathClear(board, from, to);
  }

  if (Math.abs(rowDiff) === Math.abs(colDiff) && Math.abs(rowDiff) <= moveData.diagonal) {
    return isPathClear(board, from, to);
  }

  return false;
}

const users = new Map();
const game = {
  board: freshBoard(),
  moves: [],
  chat: [],
  capturedWhite: [],
  capturedBlack: []
};

app.post('/admin/saveRuleset', async (req, res) => {
  const { ruleset_id, rules } = req.body;

  if (!ruleset_id || !rules || !Array.isArray(rules)) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    
    // Check if ruleset already exists in gamemode
    const existing = await conn.query('SELECT Ruleset_ID FROM gamemode WHERE Ruleset_ID = ?', [ruleset_id]);
    if (existing.length > 0) {
        // If it exists, we might want to update or error. For now, let's error to be safe or delete old rules.
        // Let's delete old rules for this ruleset first to allow overwrite
        await conn.query('DELETE FROM rules WHERE Ruleset_ID = ?', [ruleset_id]);
    } else {
        // Insert into gamemode first
        await conn.query('INSERT INTO gamemode (Ruleset_ID) VALUES (?)', [ruleset_id]);
    }

    // Insert new rules
    for (const rule of rules) {
      await conn.query(
        'INSERT INTO rules (Ruleset_ID, piece_type, horizontal, vertical, diagonal) VALUES (?, ?, ?, ?, ?)',
        [ruleset_id, rule.piece_type, rule.horizontal, rule.vertical, rule.diagonal]
      );
    }

    res.json({ message: `Ruleset ${ruleset_id} saved successfully!` });
  } catch (err) {
    console.error('Error saving ruleset:', err);
    res.status(500).json({ message: 'Database error saving ruleset' });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/api/rulesets', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT Ruleset_ID FROM gamemode');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching rulesets:', err);
    res.status(500).json({ message: 'Error fetching rulesets' });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/create-match', (req, res) => {
  const { ruleset, timer: timerInput } = req.body;
  
  // Basic validation
  if (!ruleset) {
    return res.status(400).send('Ruleset is required');
  }

  // Update global timer settings
  if (timerInput) {
      const newTime = parseInt(timerInput);
      if (!isNaN(newTime) && newTime > 0) {
          startTime = newTime;
          timer = newTime;
          console.log(`Timer set to ${startTime} seconds`);
      }
  }

  // Insert into database
  // Note: We are currently ignoring 'timer' as it is not in the schema
  // We are also setting admin_ID, player1_ID, player2_ID to NULL for now
  const query = 'INSERT INTO gamematch (Ruleset_ID) VALUES (?)';
  
  db.query(query, [ruleset], (error, results) => {
    if (error) {
      console.error('Error creating match:', error);
      return res.status(500).send('Error creating match');
    }
    
    console.log('Match created with ID:', results.insertId);
    // Redirect to the match page as a spectator (or admin role if preferred)
    res.redirect(`/index.html?matchID=${results.insertId}&role=spectator`);
  });
});

app.use(express.static('public'));

function formatTimer (totalSeconds) {
  totalSeconds = Math.ceil(totalSeconds); //round up to integer
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Pad with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

function endGame(winnerColor, reason) {
  // 1. Determine result
  let winnerSocketId, loserSocketId;
  let result = ''; // 'white', 'black', 'draw'

  if (winnerColor === 'w') {
    winnerSocketId = match.players.white;
    loserSocketId = match.players.black;
    result = 'white';
  } else if (winnerColor === 'b') {
    winnerSocketId = match.players.black;
    loserSocketId = match.players.white;
    result = 'black';
  } else {
    // Draw
    result = 'draw';
  }

  const winnerUser = users.get(winnerSocketId);
  const loserUser = users.get(loserSocketId);
  
  // We need the matchID. Try to get it from users or global match object
  const matchID = (winnerUser && winnerUser.matchID) || (loserUser && loserUser.matchID) || match.id;

  console.log(`Game Over. Winner: ${winnerColor}, Reason: ${reason}, MatchID: ${matchID}`);

  // 2. Update DB Stats
  if (result !== 'draw') {
    if (winnerUser && winnerUser.userID) {
      db.query('UPDATE user SET wins = wins + 1 WHERE user_ID = ?', [winnerUser.userID], (err) => {
        if (err) console.error('Error updating winner stats:', err);
      });
    }
    if (loserUser && loserUser.userID) {
      db.query('UPDATE user SET losses = losses + 1 WHERE user_ID = ?', [loserUser.userID], (err) => {
        if (err) console.error('Error updating loser stats:', err);
      });
    }
  } else {
    // Draw logic
    if (winnerUser && winnerUser.userID) {
       db.query('UPDATE user SET draws = draws + 1 WHERE user_ID = ?', [winnerUser.userID], (err) => {
        if (err) console.error('Error updating draw stats:', err);
      });
    }
    if (loserUser && loserUser.userID) {
       db.query('UPDATE user SET draws = draws + 1 WHERE user_ID = ?', [loserUser.userID], (err) => {
        if (err) console.error('Error updating draw stats:', err);
      });
    }
  }

  // 3. Emit Game Over
  io.emit('game-over', { winner: winnerColor, reason: reason });

  // 4. Delete Match
  if (matchID) {
    // Delete spectators first (foreign key constraint?)
    db.query('DELETE FROM match_spectators WHERE match_ID = ?', [matchID], (err) => {
        if (err) console.error('Error deleting spectators:', err);
        
        // Delete match
        db.query('DELETE FROM gamematch WHERE match_ID = ?', [matchID], (err) => {
            if (err) console.error('Error deleting match:', err);
            else console.log(`Match ${matchID} deleted.`);
        });
    });
  }

  // 5. Stop Timer
  if (countdown) clearInterval(countdown);
}

let countdown = null;
let timer = 600;
let startTime = timer;

function timerOnWhenPlayersJoin(){
if (countdown) clearInterval(countdown);
if (match.players.white && match.players.black){ //activate when both colors aren't null (both players join)

    countdown = setInterval(() => {
      timer -= 1;

      io.emit('Timer:',{raw: timer, formatted: formatTimer(timer)});
   if (!match.players.white || !match.players.black) { //if either player leaves, stop timer
        timer = startTime;
        clearInterval(countdown);
     } 	

   if (timer <= 0) {
    timer = 0;
    io.emit('Timer:',{message: "Times up!"});
    clearInterval(countdown);
    if (match.turn === "w") {
	io.emit('endGameHandler', 'Black Wins');
      }
    else {
	io.emit('endGameHandler', 'White Wins');
      }
    timer = startTime;
    //code for win/stalemate cond
    
    const loser = match.turn;
    const winner = loser === 'w' ? 'b' : 'w';
    endGame(winner, 'Timeout');
    return;
   }
  },1000);  
 }
}


io.emit('Timer:', { //pass timer broadcast here so the client receives the updated turn
    raw: timer,
    formatted: formatTimer(timer)
});

// Reset timer to the configured start time (Move Timer logic)
timer = startTime;
timerOnWhenPlayersJoin();
}

io.on('connection', async (socket) => {
  const name = socket.handshake.query.name || `user-${users.size + 1}`;
  const requestedRole = socket.handshake.query.role;
  const matchID = socket.handshake.query.matchID;
  const userID = socket.handshake.query.user;
  const user = { id: socket.id, name: String(name), joinedAt: Date.now(), matchID: matchID, userID: userID, role: requestedRole};
  let playerColor;

  pushOrDel({
    ID: user.userID,
    type: 'push',
    matchID: user.matchID,
    role: user.role
  }); //calls function to put or delete into db

  // Load ruleset for this match if provided
  if (matchID) {
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query('SELECT Ruleset_ID FROM gamematch WHERE match_ID = ?', [matchID]);
      conn.release();
      
      if (rows.length > 0) {
        const rulesetID = rows[0].Ruleset_ID;
        user.rulesetID = rulesetID;
        
        // Load rules if not already cached
        if (!movementCache[rulesetID]) {
          await loadMovementRules(rulesetID);
        }
        
        // If this is the first player or we are setting up the match, store the ruleset ID in the match object
        // Note: This is a simplification for the single-match architecture. 
        // Ideally, 'match' should be keyed by matchID.
        if (!match.rulesetID) {
            match.rulesetID = rulesetID;
        }
        if (!match.id) {
            match.id = matchID;
        }
      }
    } catch (err) {
      console.error('Error loading match rules:', err);
    }
  } else {
      // Fallback to default 'C' if no matchID provided (legacy support)
      user.rulesetID = 'C';
      if (!movementCache['C']) {
          await loadMovementRules('C');
      }
      if (!match.rulesetID) match.rulesetID = 'C';
  }

  if (requestedRole === 'spectator' || requestedRole === 'admin') {
    playerColor = 'spectator';
  } else if (!match.players.white || match.players.white === socket.id) { 
   match.players.white = socket.id;
   playerColor = 'w';
  } else if (!match.players.black || match.players.black === socket.id) { 
   match.players.black = socket.id;
   playerColor = 'b';
  } else {
    playerColor = 'spectator'; 
  }

  user.color = playerColor;
  users.set(socket.id, user);
  
  timerOnWhenPlayersJoin(); //called when two players join match


  socket.emit('init', {
    board: game.board,
    users: Array.from(users.values()),
    moves: game.moves,
    color: playerColor,
    timer: timer,
    turn: match.turn,
    chat: game.chat,
    capturedWhite: game.capturedWhite,
    capturedBlack: game.capturedBlack,
    rules: movementCache[user.rulesetID || match.rulesetID || 'C'] || null
  });

  socket.broadcast.emit('user-joined', user);

  socket.on('move', async (payload = {}) => {
    const from = payload.from;
    const to = payload.to;
    const piece = payload.piece || game.board[from.row][from.col];

    if (!from || !to || !piece) return;
    if (!isOnBoard(from.row) || !isOnBoard(from.col) || !isOnBoard(to.row) || !isOnBoard(to.col)) return;

    // Turn enforcement
    const pieceColor = piece.charAt(0); // 'w' or 'b'
    if (pieceColor !== match.turn) {
        socket.emit('invalid-move', { message: 'Not your turn', from, to, piece });
        return;
    }
    
    // Ensure the user is playing the correct color
    if (user.color !== 'spectator' && user.color !== pieceColor) {
         socket.emit('invalid-move', { message: 'You can only move your own pieces', from, to, piece });
         return;
    }

    // Use the ruleset ID from the user or the match
    const rulesetID = user.rulesetID || match.rulesetID || 'C';
    const valid = await isValidMoveDB(game.board, from, to, piece, rulesetID);
    if (!valid) {
      console.log(`Invalid move attempt by ${user.name} (${user.color}): ${piece} from ${from.row},${from.col} to ${to.row},${to.col} (Ruleset: ${rulesetID})`);
      socket.emit('invalid-move', { message: 'Invalid move for this piece', from, to, piece });
      return;
    }

    const capturedPiece = game.board[to.row][to.col];
    if (capturedPiece) {
      // Add to appropriate captured list based on piece color
      if (capturedPiece.startsWith('w')) {
        game.capturedWhite.push(capturedPiece);
        if (capturedPiece[1] == 'k') {
          io.emit('endGameHandler', 'Black Wins');
        }
      } else if (capturedPiece.startsWith('b')) {
        game.capturedBlack.push(capturedPiece);
	if (capturedPiece[1] == 'k') {
          io.emit('endGameHandler', 'White Wins');
        }
      }
      if (capturedPiece.startsWith('w')) game.capturedWhite.push(capturedPiece);
      else game.capturedBlack.push(capturedPiece);

      // Check for King Capture
      if (capturedPiece.endsWith('k')) { // 'wk' or 'bk'
          const winner = capturedPiece.startsWith('w') ? 'b' : 'w';
          
          // Emit move first so clients see the capture
          game.board[to.row][to.col] = piece;
          game.board[from.row][from.col] = null;
          
          const move = {
            userId: user.id,
            userName: user.name,
            from,
            to,
            piece,
            capturedPiece: capturedPiece,
            timestamp: Date.now()
          };
          game.moves.push(move);
          
          io.emit('move', {
            board: game.board,
            move,
            capturedWhite: game.capturedWhite,
            capturedBlack: game.capturedBlack
          });

          endGame(winner, 'King Capture');
          return;
      }
    }

    game.board[to.row][to.col] = piece;
    game.board[from.row][from.col] = null;

    const move = {
      userId: user.id,
      userName: user.name,
      from,
      to,
      piece,
      capturedPiece: capturedPiece || null,
      timestamp: Date.now()
    };
    game.moves.push(move);

    match.turn = match.turn === 'w' ? 'b' : 'w'; // after movement, if white moved, black can move, vice versa
    switch (match.turn){
     case "w":
        io.emit('Turn:',{turn:match.turn});
        break;
     case "b":
        io.emit('Turn:',{turn:match.turn});
        break;
     }
    io.emit('move', {
      board: game.board,
      move,
      capturedWhite: game.capturedWhite,
      capturedBlack: game.capturedBlack,
      turn: match.turn
    });
  });


  socket.on('chat-message', (payload = {}) => {
    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    if (!text) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      userId: user.id,
      userName: user.name,
      text,
      timestamp: Date.now()
    };
    game.chat.push(message);
    if (game.chat.length > 200) game.chat.shift();
    io.emit('chat-message', message);
  });

  socket.on('reset', () => {
    game.board = freshBoard();
    game.moves = [];
    game.chat = [];
    game.capturedWhite = [];
    game.capturedBlack = [];
    match.turn = 'w'; // Reset turn to white
    timer = startTime; // Reset timer
    io.emit('reset', {
      board: game.board,
      chat: game.chat,
      capturedWhite: game.capturedWhite,
      capturedBlack: game.capturedBlack,
      match: match.turn,
      timer: timer
    });
  });
// matchData works but sql not updating parameters before next line of code showing win/loss not implemented yet
  socket.on('requestMatchData', async () => {
    try {
        const [matches] = await db.promise().query('SELECT * FROM gamematch;');
        
        for (let match of matches) {
            // Initialize defaults
            match.player1Win = 0; match.player1Draw = 0; match.player1Loss = 0;
            match.player2Win = 0; match.player2Draw = 0; match.player2Loss = 0;

            if (match.player1_ID) {
                const [rows] = await db.promise().query('SELECT wins, draws, losses FROM user WHERE user_ID = ?', [match.player1_ID]);
                if (rows.length > 0) {
                    match.player1Win = rows[0].wins;
                    match.player1Draw = rows[0].draws;
                    match.player1Loss = rows[0].losses;
                }
            }
            
            if (match.player2_ID) {
                const [rows] = await db.promise().query('SELECT wins, draws, losses FROM user WHERE user_ID = ?', [match.player2_ID]);
                if (rows.length > 0) {
                    match.player2Win = rows[0].wins;
                    match.player2Draw = rows[0].draws;
                    match.player2Loss = rows[0].losses;
                }
            }
        }
        
        socket.emit('matchDataRecieved', matches);
    } catch (err) {
        console.error("Error fetching match data:", err);
    }
  });

  socket.on('disconnect', () => {
  // Check if the user was a player and free the slot
  if (match.players.white === socket.id) { 
    match.players.white = null;
    console.log("White player disconnected, slot freed");
  } else if (match.players.black === socket.id) {
    match.players.black = null;
    console.log("Black player disconnected, slot freed");
  }
  
  // Also check by userID to handle reconnects where socket ID changed but user is same
  // This is a bit of a hack for the single-match global state
  if (user.color === 'w' && match.players.white === null) {
      // Already handled above
  } else if (user.color === 'w') {
      // If user was white but socket ID didn't match (shouldn't happen if users map is correct)
      // But if they reconnected, the old socket is gone.
  }
  
    pushOrDel({
      ID: user.userID,
      type: 'delete',
      matchID: user.matchID,
      role: user.role
    }); //calls function to delete player from match in db
    users.delete(socket.id);
    io.emit('user-left', user.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Chess server ready on port ${port}`);
});

