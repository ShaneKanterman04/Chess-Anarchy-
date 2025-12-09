
(function () {
  const params = new URLSearchParams(window.location.search); //turns "index" and "role" URL into an object
  const role = (params.get('role') || 'spectator').toLowerCase(); //reads role from url; if role undefined/null, use spectator as fallback
  const user = params.get('user');
  const matchID = params.get('matchID');
   
  const requestedName = (window.prompt('Enter a display name (optional):') || '').trim();
  const socket = io({ query: { name: requestedName, role, matchID, user} });
  window.addEventListener("beforeunload", () => {
       socket.disconnect();
   });     
  const state = {
    board: [],
    users: [],
    moves: [],
    chat: [],
    capturedWhite: [],
    capturedBlack: [],
    role,
    user,
    color: null  // Will be set by server: 'w', 'b', or 'spectator'
  };

  let selection = null;

  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const userListEl = document.getElementById('user-list');
  const moveLogEl = document.getElementById('move-log');
  const userNameEl = document.getElementById('user-name');
  const clearSelectionBtn = document.getElementById('clear-selection');
  const resetBtn = document.getElementById('reset');
  const chatLogEl = document.getElementById('chat-log');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const capturedWhiteEl = document.getElementById('captured-white');
  const capturedBlackEl = document.getElementById('captured-black');
  const showTime = document.getElementById('showtime');
  const showTurn = document.getElementById('showturn');

  const pieceLabels = {
    br: 'bR',
    bn: 'bN',
    bb: 'bB',
    bq: 'bQ',
    bk: 'bK',
    bp: 'bP',
    wr: 'wR',
    wn: 'wN',
    wb: 'wB',
    wq: 'wQ',
    wk: 'wK',
    wp: 'wP'
  };

  // Client-side move validation (mirrors server logic for UI feedback)
  function getPieceColor(piece) {
    if (!piece) return null;
    return piece[0];
  }

  function getPieceType(piece) {
    if (!piece) return null;
    return piece[1];
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
    const direction = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);
    const targetPiece = board[to.row][to.col];
    
    if (colDiff === 0 && rowDiff === direction && !targetPiece) {
      return true;
    }
    
    if (colDiff === 0 && rowDiff === 2 * direction && from.row === startRow && !targetPiece) {
      const middleRow = from.row + direction;
      if (!board[middleRow][from.col]) {
        return true;
      }
    }
    
    if (colDiff === 1 && rowDiff === direction && targetPiece && getPieceColor(targetPiece) !== color) {
      return true;
    }
    
    return false;
  }

  function isValidRookMove(board, from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    if (rowDiff !== 0 && colDiff !== 0) return false;
    
    return isPathClear(board, from, to);
  }

  function isValidKnightMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  function isValidBishopMove(board, from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    if (rowDiff !== colDiff) return false;
    
    return isPathClear(board, from, to);
  }

  function isValidQueenMove(board, from, to) {
    return isValidRookMove(board, from, to) || isValidBishopMove(board, from, to);
  }

  function isValidKingMove(from, to) {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    return rowDiff <= 1 && colDiff <= 1;
  }

  function isValidMove(board, from, to, piece) {
    if (from.row === to.row && from.col === to.col) return false;
    
    const pieceType = getPieceType(piece);
    const pieceColor = getPieceColor(piece);
    const targetPiece = board[to.row][to.col];
    
    if (targetPiece && getPieceColor(targetPiece) === pieceColor) {
      return false;
    }
    
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

  function getValidMoves(board, from, piece) {
    const validMoves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(board, from, { row, col }, piece)) {
          validMoves.push({ row, col });
        }
      }
    }
    return validMoves;
  }



  function setStatus(text) {
    statusEl.textContent = text;
  }

  function squareLabel(position) {
    if (!position) return '';
    return `(${position.row},${position.col})`;
  }

  function labelForPiece(code) {
    return pieceLabels[code] || '';
  }

  function handleCellClick(event, role) {
   // Use server-assigned color, not URL role
   if (state.color === 'spectator'){
 	return;  
   }
	
   else {    
    const cell = event.currentTarget;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col); 
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      return;
    }

    if (!selection) {
      const piece = state.board[row] && state.board[row][col];
      if (!piece) {
        return;
      }
      selection = { row, col };
      renderBoard(state.board);
      return;
    }

    if (selection.row === row && selection.col === col) {
      selection = null;
      renderBoard(state.board);
      return;
    }

    socket.emit('move', {
      from: { row: selection.row, col: selection.col },
      to: { row, col }
    });
    selection = null;
  }
}

// Peter's special socket listeners for the timer and turn events
socket.on('Timer:', (data) => {

	if (data.message) { //if there's no "Times up" message from the server, just show the timer
         showTime.textContent = data.message;
         return;
        }

	if (data.formatted !== undefined) {
        showTime.textContent = data.formatted; 
	}

});

socket.on('Turn:', data => {
    if (data.turn === "w") {
        showTurn.textContent = "White's turn";
    } else if (data.turn === "b") {
        showTurn.textContent = "Black's turn";
    }
});

function renderTurn(turn) {
  const turnBox = document.getElementById('turn-box');

  if (!turnBox) return; // fail-safe

  if (turn === 'w') {
    turnBox.textContent = "White's turn";
  } else if (turn === 'b') {
    turnBox.textContent = "Black's turn";
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

function renderTimer(time) {
  const timerBox = document.getElementById('timer-box');

  if (!timerBox) return; // fail-safe

  
  timerBox.textContent = formatTimer(time);

}
  function renderBoard(board) {
    boardEl.innerHTML = '';
    const validMoves = selection ? getValidMoves(board, selection, board[selection.row][selection.col]) : [];
    
    board.forEach((row, rowIndex) => {
      row.forEach((code, colIndex) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.row = String(rowIndex);
        button.dataset.col = String(colIndex);
        button.className = `cell ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'}`;
        
        if (selection && selection.row === rowIndex && selection.col === colIndex) {
          button.classList.add('selected');
        }
        
        // Highlight valid move targets
        const isValidTarget = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
        if (isValidTarget) {
          button.classList.add('valid-target');
        }
        
        const label = labelForPiece(code);
        button.textContent = label;
        button.addEventListener('click', handleCellClick);
        boardEl.appendChild(button);
      });
    });
  }

  function updateUsers(users) {
    userListEl.innerHTML = '';
    users.forEach((user) => {
      const item = document.createElement('li');
      item.textContent = user.name; 
      if (user.id === socket.id) {
        item.classList.add('self');
      }
      userListEl.appendChild(item);
    });

    const self = users.find((user) => user.id === socket.id);
    if (self) {
      userNameEl.textContent = self.name;
    }
  }

  // Chat is disabled for players (white/black), enabled for spectators
  // Note: This runs before init, so we check URL role first
  // The server will confirm actual color assignment
  if (state.role == "player"){ 
    chatInput.disabled = true;
    chatInput.placeholder = 'chat disabled for players';
  }

  function updateMoveLog(moves) {
    moveLogEl.innerHTML = '';
    moves.forEach((move, index) => {
      const item = document.createElement('li');
      const actor = move.userName || move.userId;
      item.textContent = `${index + 1}. ${actor}: ${squareLabel(move.from)} -> ${squareLabel(move.to)} using ${move.piece}`;
      moveLogEl.appendChild(item);
    });
  }

  function renderChat(messages) {
    chatLogEl.innerHTML = '';
    messages.forEach((message) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'chat-message';
      const sender = document.createElement('span');
      sender.className = 'sender';
      sender.textContent = message.userName || message.userId || 'anon';
      const text = document.createElement('span');
      text.textContent = message.text;
      wrapper.appendChild(sender);
      wrapper.appendChild(text);
      chatLogEl.appendChild(wrapper);
    });
    chatLogEl.scrollTop = chatLogEl.scrollHeight;
  }

  function renderCapturedPieces() {
    if (capturedWhiteEl) {
      capturedWhiteEl.innerHTML = '';
      state.capturedWhite.forEach((piece) => {
        const span = document.createElement('span');
        span.className = 'captured-piece';
        span.textContent = labelForPiece(piece);
        capturedWhiteEl.appendChild(span);
      });
      if (state.capturedWhite.length === 0) {
        capturedWhiteEl.textContent = 'None';
      }
    }
    
    if (capturedBlackEl) {
      capturedBlackEl.innerHTML = '';
      state.capturedBlack.forEach((piece) => {
        const span = document.createElement('span');
        span.className = 'captured-piece';
        span.textContent = labelForPiece(piece);
        capturedBlackEl.appendChild(span);
      });
      if (state.capturedBlack.length === 0) {
        capturedBlackEl.textContent = 'None';
      }
    }
  }

  clearSelectionBtn.addEventListener('click', () => {
    selection = null;
    renderBoard(state.board);
  });

  resetBtn.addEventListener('click', () => {
    socket.emit('reset');
  });

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    socket.emit('chat-message', { text });
    chatInput.value = '';
  });

  socket.on('connect', () => {
    setStatus('Connected');
  });

  socket.on('disconnect', () => {
    setStatus('Disconnected');
  });

  socket.on('connect_error', () => {
    setStatus('Connection error');
  });

  socket.on('init', (payload) => {
    state.board = payload.board || [];
    state.users = payload.users || [];
    state.moves = payload.moves || [];
    state.chat = payload.chat || [];
    state.capturedWhite = payload.capturedWhite || [];
    state.capturedBlack = payload.capturedBlack || [];
    state.color = payload.color || 'spectator';  // Store assigned color from server
    state.turn = payload.turn || 'w';
    state.timer = payload.timer;
    selection = null;
    renderBoard(state.board);
    updateUsers(state.users);
    updateMoveLog(state.moves);
    renderChat(state.chat);
    renderCapturedPieces();
    
    // Render initial turn and timer from server
    if (state.turn) {
      renderTurn(state.turn);
    }
    if (state.timer !== undefined) {
      renderTimer(state.timer);
    }
    
    // Update status to show assigned color
    if (state.color === 'w') {
      setStatus('Connected - Playing as White');
    } else if (state.color === 'b') {
      setStatus('Connected - Playing as Black');
    } else {
      setStatus('Connected - Spectating');
    }
  });

  socket.on('move', ({ board, move, capturedWhite, capturedBlack }) => {
    state.board = board || state.board;
    state.moves.push(move);
    state.capturedWhite = capturedWhite || state.capturedWhite;
    state.capturedBlack = capturedBlack || state.capturedBlack;
    renderBoard(state.board);
    updateMoveLog(state.moves);
    renderCapturedPieces();
  });

  socket.on('reset', ({ board, chat, capturedWhite, capturedBlack, match, timer }) => {
    state.board = board || state.board;
    state.moves = [];
    state.chat = chat || [];
    state.capturedWhite = capturedWhite || [];
    state.capturedBlack = capturedBlack || [];
    selection = null;
    if (match !== undefined) { 
    state.turn = match;
    renderTurn(state.turn);
    }

    if (timer !== undefined) {
    state.timer = timer;
    renderTimer(state.timer);
    }
    renderBoard(state.board);
    updateMoveLog(state.moves);
    renderChat(state.chat);
    renderCapturedPieces();
    document.getElementById('endGamePopUp').style.display = 'none';
    document.getElementById('popUpContent').style.display = 'none';
  });

  socket.on('user-joined', (user) => {
    state.users = state.users.filter((existing) => existing.id !== user.id).concat(user);
    updateUsers(state.users);
   });

  socket.on('user-left', (userId) => {
    state.users = state.users.filter((user) => user.id !== userId);
    updateUsers(state.users);
  });

  socket.on('chat-message', (message) => {
    state.chat.push(message);
    renderChat(state.chat);
  });

  socket.on('invalid-move', (data) => {
    setStatus(`Invalid move: ${data.message}`);
    setTimeout(() => {
      setStatus('Connected');
    }, 3000);
  });

  socket.on('endGameHandler', (winner) => {
    document.getElementById('winnerText').textContent = winner;
    document.getElementById('endGamePopUp').style.display = 'block';
    document.getElementById('popUpContent').style.display = 'block';
  });

  socket.on('getUserID', (method) => {
    console.log('getuserID called', method);
    socket.emit('userID-push-delete', {
      ID: state.user,
      type: method
    });
  });
})();
