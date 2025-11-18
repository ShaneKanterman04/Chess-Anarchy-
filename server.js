const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static('public'));

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

const users = new Map();
const game = {
  board: freshBoard(),
  moves: [],
  chat: []
};

function freshBoard() {
  return baseBoard.map((row) => row.slice());
}

function isOnBoard(value) {
  return Number.isInteger(value) && value >= 0 && value < 8;
}




//checking for a legal move
function valid_move(board, start_sqr, end_sqr, piece) {
  const [color, type] = [piece[0], piece[1]];
  const dx = end_sqr.col - start_sqr.col;
  const dy = end_sqr.row - start_sqr.row;

  //can't land on another piece
  const target = board[end_sqr.row][end_sqr.col];
  if (target && target[0] === color) return false;

  //piece types
  switch (type) {
    case 'p': return valid_pawn_move(board, start_sqr, end_sqr, color);
    case 'r': return valid_rook_move(board, start_sqr, end_sqr);
    case 'n': return valid_knight_move(dx, dy);
    case 'b': return valid_bishop_move(board, start_sqr, end_sqr);
    case 'q': return valid_queen_move(board, start_sqr, end_sqr);
    case 'k': return valid_king_move(dx, dy);
    default: return false;
  }

}

//valid pawn move
function valid_pawn_move(board, from, to, color) {
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;
  const dy = to.row - from.row;
  const dx = to.col - from.col;

  // move forward 1
  if (dx === 0 && dy === dir && !board[to.row][to.col]) return true;

  // move forward 2 from start spot
  if (
    dx === 0 &&
    dy === 2 * dir &&
    from.row === startRow &&
    !board[from.row + dir][from.col] &&
    !board[to.row][to.col]
  ) return true;

  // capture diagonally
  if (
    Math.abs(dx) === 1 &&
    dy === dir &&
    board[to.row][to.col]
  ) return true;

  return false;
}


//valid rook move
function valid_rook_move(board, from, to) {
  if (from.row !== to.row && from.col !== to.col) return false;

  const stepRow = Math.sign(to.row - from.row);
  const stepCol = Math.sign(to.col - from.col);

  let r = from.row + stepRow;
  let c = from.col + stepCol;

  while (r !== to.row || c !== to.col) {
    if (board[r][c]) return false; // path blocked
    r += stepRow;
    c += stepCol;
  }
  return true;
}

//valid knight move
function valid_knight_move(dx, dy) {
  return (Math.abs(dx) === 1 && Math.abs(dy) === 2) ||
         (Math.abs(dx) === 2 && Math.abs(dy) === 1);
}


//valid bishop move
function valid_bishop_move(board, from, to) {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  if (Math.abs(dx) !== Math.abs(dy)) return false;

  const stepRow = Math.sign(dy);
  const stepCol = Math.sign(dx);

  let r = from.row + stepRow;
  let c = from.col + stepCol;

  while (r !== to.row || c !== to.col) {
    if (board[r][c]) return false; // path blocked
    r += stepRow;
    c += stepCol;
  }
  return true;
}

//valid queen move
function valid_queen_move(board, from, to) {
  return valid_rook_move(board, from, to) || valid_bishop_move(board, from, to);
}

//valid king move
function valid_king_move(dx, dy) {
  return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
}








app.get('/', (req, res) => {
  res.json({ status: 'ready', users: users.size });
});

io.on('connection', (socket) => {
  const name = socket.handshake.query.name || `user-${users.size + 1}`;
  const user = { id: socket.id, name: String(name), joinedAt: Date.now() };
  users.set(socket.id, user);

  socket.emit('init', {
    board: game.board,
    users: Array.from(users.values()),
    moves: game.moves,
    chat: game.chat
  });

  socket.broadcast.emit('user-joined', user);

  

  socket.on('move', (payload = {}) => {
    const from = payload.from;
    const to = payload.to;

    if (!from || !to) return;
    if (!isOnBoard(from.row) || !isOnBoard(from.col)) return;
    if (!isOnBoard(to.row) || !isOnBoard(to.col)) return;

    const piece = game.board[from.row][from.col];
    if (!piece) return;

    const color = piece[0];

    // Validate move
    if (!valid_move(game.board, from, to, piece)) {
      socket.emit("invalid-move", { reason: "illegal move" });
      return;
    }

    // Apply move
    game.board[to.row][to.col] = piece;
    game.board[from.row][from.col] = null;

    const move = {
      userId: user.id,
      userName: user.name,
      from,
      to,
      piece,
      timestamp: Date.now()
    };

    game.moves.push(move);

    io.emit('move', {
      board: game.board,
      move
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
    io.emit('reset', { board: game.board, chat: game.chat });
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('user-left', user.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`chess server ready on port ${port}`);
});
