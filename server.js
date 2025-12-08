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

db.query('SHOW TABLES;', function (error, results, fields) {
  if (error) {
    console.log(error);
    return;
  }
  console.log('Rows: ', results);
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

<<<<<<< HEAD


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public','sign-up.html'));
=======
//The connection to MariaDB
const pool = mariadb.createPool({
  host: '34.74.157.230',
  user: 'Team5',
  password: 'Team05!!',
  database: 'chess',
  connectionLimit: 5
>>>>>>> main
});


<<<<<<< HEAD
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
=======


let movementCache = {};
>>>>>>> main


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
<<<<<<< HEAD
  });
});
app.use(express.static('public'));
=======
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


>>>>>>> main
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
  const moveData = await getPieceMovement(type, rulesetID);
  if (!moveData) return false;

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
  const { ruleset, timer } = req.body;
  
  // Basic validation
  if (!ruleset) {
    return res.status(400).send('Ruleset is required');
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
    // Redirect back to admin page or match list
    res.redirect('/matchSearch.html');
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pre-index.html'));
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
   }
  },1000);  
 }
}



io.on('connection', async (socket) => {
  const name = socket.handshake.query.name || `user-${users.size + 1}`;
  const requestedRole = socket.handshake.query.role;
  const matchID = socket.handshake.query.matchID;
  
  const user = { id: socket.id, name: String(name), joinedAt: Date.now(), matchID: matchID };
  let playerColor;

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
  } else if (!match.players.white) { 
   match.players.white = socket.id;
   playerColor = 'w';
  } else if (!match.players.black) { 
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
    capturedBlack: game.capturedBlack
  });

  socket.broadcast.emit('user-joined', user);

  socket.on('move', async (payload = {}) => {
    const from = payload.from;
    const to = payload.to;
    const piece = payload.piece || game.board[from.row][from.col];

    if (!from || !to || !piece) return;
    if (!isOnBoard(from.row) || !isOnBoard(from.col) || !isOnBoard(to.row) || !isOnBoard(to.col)) return;

    // Use the ruleset ID from the user or the match
    const rulesetID = user.rulesetID || match.rulesetID || 'C';
    const valid = await isValidMoveDB(game.board, from, to, piece, rulesetID);
    if (!valid) {
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
      capturedBlack: game.capturedBlack
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
    io.emit('reset', {
      board: game.board,
      chat: game.chat,
      capturedWhite: game.capturedWhite,
      capturedBlack: game.capturedBlack,
      match: match.turn,
      timer: timer
    });
  });

  socket.on('requestMatchData', () => {
    db.query('SELECT * FROM gamematch;', function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('match data info: ', results);
        socket.emit('matchDataRecieved', results)
      }
    });
  });

  socket.on('disconnect', () => {
  if (match.players.white === socket.id) { //if either player leaves they lose their color
    match.players.white = null;
    console.log("White player disconnected, slot freed");
  }

  if (match.players.black === socket.id) {
    match.players.black = null;
    console.log("Black player disconnected, slot freed");
  }
    users.delete(socket.id);
    io.emit('user-left', user.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Chess server ready on port ${port}`);
});

