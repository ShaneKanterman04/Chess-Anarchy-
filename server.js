const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
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
  res.sendFile(path.join(__dirname,'public/pre-index.html'));
});

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
  chat: [],
  capturedWhite: [],
  capturedBlack: []
};

function freshBoard() {
  return baseBoard.map((row) => row.slice());
}

function isOnBoard(value) {
  return Number.isInteger(value) && value >= 0 && value < 8;
}

// Move validation functions
function getPieceColor(piece) {
  if (!piece) return null;
  return piece[0]; // 'w' or 'b'
}

function getPieceType(piece) {
  if (!piece) return null;
  return piece[1]; // 'p', 'r', 'n', 'b', 'q', 'k'
}


function isPathClear(board, from, to) {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
  
  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;
  
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  return true;
}


function isValidPawnMove(board, from, to, piece) {
  const color = getPieceColor(piece);
  const direction = color === 'w' ? -1 : 1; // white moves up (decreasing row), black moves down
  const startRow = color === 'w' ? 6 : 1;
  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);
  const targetPiece = board[to.row][to.col];
  if (colDiff === 0 && rowDiff === direction && !targetPiece) {
    return true;
  }
  
  // Move forward two squares from starting position
  if (colDiff === 0 && rowDiff === 2 * direction && from.row === startRow && !targetPiece) {
    const middleRow = from.row + direction;
    if (!board[middleRow][from.col]) {
      return true;
    }
  }
  
  // Capture diagonally
  if (colDiff === 1 && rowDiff === direction && targetPiece && getPieceColor(targetPiece) !== color) {
    return true;
  }
  
  return false;
}

function isValidRookMove(board, from, to) {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  
  // Must move in straight line (horizontal or vertical)
  if (rowDiff !== 0 && colDiff !== 0) return false;
  
  return isPathClear(board, from, to);
}

function isValidKnightMove(from, to) {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  
  // L-shape: 2 in one direction, 1 in the other
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(board, from, to) {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  
  // Must move diagonally
  if (rowDiff !== colDiff) return false;
  
  return isPathClear(board, from, to);
}

function isValidQueenMove(board, from, to) {
  // Queen moves like rook or bishop
  return isValidRookMove(board, from, to) || isValidBishopMove(board, from, to);
}

function isValidKingMove(from, to) {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  
  // King moves one square in any direction
  return rowDiff <= 1 && colDiff <= 1;
}

function isValidMove(board, from, to, piece) {
  // Can't move to same square
  if (from.row === to.row && from.col === to.col) return false;
  
  const pieceType = getPieceType(piece);
  const pieceColor = getPieceColor(piece);
  const targetPiece = board[to.row][to.col];
  
  // Can't capture your own piece
  if (targetPiece && getPieceColor(targetPiece) === pieceColor) {
    return false;
  }
  
  // Check piece-specific rules
  switch (pieceType) {
    case 'p': return isValidPawnMove(board, from, to, piece);
    case 'r': return isValidRookMove(board, from, to);
    case 'n': return isValidKnightMove(from, to);
    case 'b': return isValidBishopMove(board, from, to);
    case 'q': return isValidQueenMove(board, from, to);
    case 'k': return isValidKingMove(from, to);
    default: return false;
  }
}

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
let timer = 10;
let startTime = timer; //makes the timer work for some reason
function timerOnWhenPlayersJoin(){
if (countdown) clearInterval(countdown);
if (match.players.white && match.players.black){ //activate when both colors aren't null (both players join)

    countdown = setInterval(() => {
      timer -= 1;

      io.emit('Timer:',{raw: timer, formatted: formatTimer(timer)});
   if (!match.players.white || !match.players.black) { //if either player leaves, stop timer
        timer = 10;
        clearInterval(countdown);
     } 	

   if (timer <= 0) {
    timer = 0;
    io.emit('Timer:',{message: "Times up!"});
    clearInterval(countdown);
    timer = 10;
    //code for win/stalemate cond
    return;
   }
  },1000);  
   
   
 }
}

function timerResetWhenPlayerMoves (){
io.emit('Turn:', { turn: match.turn }); 

io.emit('Timer:', { //pass timer broadcast here so the client receives the updated turn
    raw: timer,
    formatted: formatTimer(timer)
});
switch (match.turn){
     case "w":
	io.emit('Turn:',{turn:match.turn});
	break;
     case "b":
	io.emit('Turn:',{turn:match.turn});
	break;
     }
timer = 10;
timerOnWhenPlayersJoin();



}
io.on('connection', (socket) => {
  const name = socket.handshake.query.name || `user-${users.size + 1}`;
  const user = { id: socket.id, name: String(name), joinedAt: Date.now() };
  let playerColor;

  if (!match.players.white) { //is white in players falsy (null, undefined, NaN, false, "") in the match obj? Assign that color to socket user 
   match.players.white = socket.id;
   playerColor = 'w';
} else if (!match.players.black) { //give second player black if black is also falsy
   match.players.black = socket.id;
   playerColor = 'b';
   

} else {
  playerColor = 'spectator'; //become spect if player count for match fills up
}
  user.color = playerColor; //upon joining, players are automatically assigned colors (white if 1st, black if 2nd)
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

  socket.on('move', (payload = {}) => {
    const from = payload.from;
    const to = payload.to;
    if (!from || !to) return;
    if (!isOnBoard(from.row) || !isOnBoard(from.col)) return;
    if (!isOnBoard(to.row) || !isOnBoard(to.col)) return;

    const piece = payload.piece || game.board[from.row][from.col];
    if (!piece) return;
    
    const playerColor = user.color; 
    const pieceColor = getPieceColor(piece);

    
    // Validate the move
    if (!isValidMove(game.board, from, to, piece)) {
      socket.emit('invalid-move', {
        message: 'Invalid move for this piece',
        from,
        to,
        piece
      });
      return;
    }

   if (playerColor !== pieceColor) { //let color move color
     socket.emit('invalid-move', { 
       message: "You cannot move your opponent's pieces"

   });
     return;

  }

  if (match.turn !== pieceColor) { //let player move depending on turn
         socket.emit('invalid-move', {
           message: "Not your turn"
       });
         return;
   
      }

 
    // Check if a piece is being captured
    const capturedPiece = game.board[to.row][to.col];
    if (capturedPiece) {
      // Add to appropriate captured list based on piece color
      if (capturedPiece.startsWith('w')) {
        game.capturedWhite.push(capturedPiece);
      } else if (capturedPiece.startsWith('b')) {
        game.capturedBlack.push(capturedPiece);
      }
    }

    const move = {
      userId: user.id,
      userName: user.name,
      from,
      to,
      piece,
      capturedPiece: capturedPiece || null,
      timestamp: Date.now()
    };

    game.board[to.row][to.col] = piece;
    game.board[from.row][from.col] = null;
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
    match.turn = 'w';
    timer = startTime;
    io.emit('reset', { 
      board: game.board, 
      chat: game.chat,
      capturedWhite: game.capturedWhite,
      capturedBlack: game.capturedBlack,
      match: match.turn,
      timer: timer
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
  console.log(`chess server ready on port ${port}`);
});
