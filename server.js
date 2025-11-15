const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
    db.end();
    }
  else {
    console.log('Rows: ', results);
    db.end();
  }
});

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
function endGame(winner) {
  const popup = document.getElementById('gameEndedPopup');
  const popupMessage = popup.querySelector('p');
  const sql = 'SELECT * FROM bCaptured WHERE ID = ?';
  if (winner == 'black') {
    meessage = "Black Wins";
    }
  else {
    meessage = "White Wins";
  }
  popupMessage.textContent = message;
  popup.style.display = "block";
  });
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

    const piece = payload.piece || game.board[from.row][from.col];
    if (!piece) return;

    const move = {
      userId: user.id,
      userName: user.name,
      from,
      to,
      piece,
      timestamp: Date.now()
    };

    game.board[to.row][to.col] = piece;
    game.board[from.row][from.col] = null;
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
