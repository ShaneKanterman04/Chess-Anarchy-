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
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const match =  { //making match obj so we can actually have turns before putting a time limit
     players: {
       white: null,
       black: null
     },	
     turn: "w" //in classic rules white goes first
};

//The connection to MariaDB
const pool = mariadb.createPool({
  host: '34.74.157.230',
  user: 'Team5',
  password: 'Team05!!',
  database: 'chess',
  connectionLimit: 5
});




let movementCache = {};


//loading in the gamemode and piec movements
async function loadMovementRules() {
  let conn;
  try {
    conn = await pool.getConnection(); //grabs the database
    const rows = await conn.query(
      'SELECT piece_type, horizontal, vertical, diagonal FROM rules  WHERE Ruleset_ID = ?',
      [RULESET_ID]
    );
    movementCache = {};
    rows.forEach(row => {
      movementCache[row.piece_type] = {
        horizontal: row.horizontal,
        vertical: row.vertical,
        diagonal: row.diagonal
      }; //adds piece rules to cache
    });
    console.log('Movement rules loaded:', movementCache); //prints the movement rules
  } finally {
    if (conn) conn.release();
  }
}

//grabbing the piece type
function getPieceMovement(pieceType) {
  return movementCache[pieceType] || null;
}

// Load rules at startup
loadMovementRules().catch(err => console.error('Failed to load movement rules:', err));


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
async function isValidMoveDB(board, from, to, piece) {
  if (!piece) return false;

  const color = getPieceColor(piece);
  const typeMap = { p: 'Pawn', r: 'Rook', n: 'Knight', b: 'Bishop', q: 'Queen', k: 'King' };
  const type = typeMap[getPieceType(piece)];
  const moveData = await getPieceMovement(type);
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pre-index.html'));
});
app.use(express.static('public'));


}
io.on('connection', (socket) => {
  const name = socket.handshake.query.name || `user-${users.size + 1}`;
  const user = { id: socket.id, name, joinedAt: Date.now() };
  users.set(socket.id, user);
  
  if (match.players.white && match.players.black && playerColor !== 'spectator') {
    setTimeout(() => timerOnWhenPlayersJoin(), 50); //called when two players join match
}

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

    const valid = await isValidMoveDB(game.board, from, to, piece);
    if (!valid) {
      socket.emit('invalid-move', { message: 'Invalid move for this piece', from, to, piece });
      return;
    }

    const capturedPiece = game.board[to.row][to.col];
    if (capturedPiece) {
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
  if (timer > 0) {
    timerResetWhenPlayerMoves();  //call this when turn happens, and the timer's still going
    }
  else {
    //pack it up bro you're not fast enough (end game)
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
