(function () {
  const requestedName = (window.prompt('Enter a display name (optional):') || '').trim();
  const socket = io({ query: { name: requestedName } });

  const state = {
    board: [],
    users: [],
    moves: []
  };

  let selection = null;

  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const userListEl = document.getElementById('user-list');
  const moveLogEl = document.getElementById('move-log');
  const userNameEl = document.getElementById('user-name');
  const clearSelectionBtn = document.getElementById('clear-selection');
  const resetBtn = document.getElementById('reset');

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

  function handleCellClick(event) {
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

  function renderBoard(board) {
    boardEl.innerHTML = '';
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

  function updateMoveLog(moves) {
    moveLogEl.innerHTML = '';
    moves.forEach((move, index) => {
      const item = document.createElement('li');
      const actor = move.userName || move.userId;
      item.textContent = `${index + 1}. ${actor}: ${squareLabel(move.from)} -> ${squareLabel(move.to)} using ${move.piece}`;
      moveLogEl.appendChild(item);
    });
  }

  clearSelectionBtn.addEventListener('click', () => {
    selection = null;
    renderBoard(state.board);
  });

  resetBtn.addEventListener('click', () => {
    socket.emit('reset');
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
    selection = null;
    renderBoard(state.board);
    updateUsers(state.users);
    updateMoveLog(state.moves);
  });

  socket.on('move', ({ board, move }) => {
    state.board = board || state.board;
    state.moves.push(move);
    renderBoard(state.board);
    updateMoveLog(state.moves);
  });

  socket.on('reset', ({ board }) => {
    state.board = board || state.board;
    state.moves = [];
    selection = null;
    renderBoard(state.board);
    updateMoveLog(state.moves);
  });

  socket.on('user-joined', (user) => {
    state.users = state.users.filter((existing) => existing.id !== user.id).concat(user);
    updateUsers(state.users);
  });

  socket.on('user-left', (userId) => {
    state.users = state.users.filter((user) => user.id !== userId);
    updateUsers(state.users);
  });
})();
