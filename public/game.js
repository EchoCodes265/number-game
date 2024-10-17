const socket = io();
let playerNumber = 0;
let isHost = false;
let roomCode = '';

function createRoom() {
  roomCode = document.getElementById('roomCode').value;
  const playerName = document.getElementById('playerName').value;
  if (!roomCode || !playerName) {
    alert("Please enter both a room code and your name.");
    return;
  }
  socket.emit('createRoom', { roomCode, playerName });
}

function joinRoom() {
  roomCode = document.getElementById('roomCode').value;
  const playerName = document.getElementById('playerName').value;
  if (!roomCode || !playerName) {
    alert("Please enter both a room code and your name.");
    return;
  }
  socket.emit('joinRoom', { roomCode, playerName });
}

function startGame() {
  if (isHost) {
    socket.emit('startGame', roomCode);
  }
}

function placeCard() {
  if (playerNumber === 0) return;
  socket.emit('placeCard', { roomCode, number: playerNumber });
  document.getElementById('playerCard').classList.add('placed');
  document.getElementById('instructions').innerText = "Waiting for other players...";
}

function newRound() {
  if (isHost) {
    socket.emit('newRound', roomCode);
  }
}

socket.on('roomCreated', ({ roomCode, players }) => {
  isHost = true;
  showGameBoard(players);
  document.getElementById('startGameBtn').classList.remove('d-none');
  document.getElementById('instructions').innerText = "Wait for players to join, then click 'Start Game'";
});

socket.on('roomNotFound', () => {
  alert('Room not found. Please check the room code and try again.');
});

socket.on('roomFull', () => {
  alert('The room is full. Please try another room code.');
});

socket.on('playerJoined', ({ players }) => {
  showGameBoard(players);
  if (!isHost) {
    document.getElementById('instructions').innerText = "Waiting for the host to start the game...";
  }
});

socket.on('gameStarted', () => {
  document.getElementById('startGameBtn').classList.add('d-none');
  document.getElementById('newRoundBtn').classList.remove('d-none');
  document.getElementById('instructions').innerText = "Game started! Look at your number and place your card when ready.";
});

socket.on('assignedNumber', (number) => {
  playerNumber = number;
  document.getElementById('cardNumber').innerText = number;
  document.getElementById('playerCard').classList.remove('placed');
  document.getElementById('instructions').innerText = "Place your card when you're ready!";
});

socket.on('cardPlaced', (count) => {
  document.getElementById('placedCardsCount').innerText = count;
});

socket.on('roundEnded', ({ success, placedCards }) => {
  const resultEl = document.getElementById('result');
  resultEl.classList.remove('d-none', 'alert-success', 'alert-danger');
  resultEl.classList.add(success ? 'alert-success' : 'alert-danger');
  
  let message = success ? 'Success! Cards were placed in the correct order: ' : 'Incorrect order. The cards were placed as: ';
  message += placedCards.join(', ');
  
  resultEl.innerText = message;
  
  if (isHost) {
    document.getElementById('instructions').innerText = "Click 'New Round' to start another round";
  } else {
    document.getElementById('instructions').innerText = "Waiting for the host to start a new round...";
  }
});

socket.on('roundStarted', () => {
  document.getElementById('playerCard').classList.remove('placed');
  document.getElementById('result').classList.add('d-none');
  document.getElementById('placedCardsCount').innerText = '0';
  document.getElementById('instructions').innerText = "New round started! Wait for your number...";
});

socket.on('playerLeft', ({ players }) => {
  showGameBoard(players);
});

function showGameBoard(players) {
  document.getElementById('gameSetup').classList.add('d-none');
  document.getElementById('gameBoard').classList.remove('d-none');
  document.getElementById('roomTitle').innerText = `Room: ${roomCode}`;
  
  const playerList = document.getElementById('playerList');
  playerList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerText = player.name + (player.isHost ? ' (Host)' : '');
    playerList.appendChild(li);
  });
}