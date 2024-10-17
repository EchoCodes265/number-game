const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const rooms = {};

io.on('connection', (socket) => {
  socket.on('createRoom', ({ roomCode, playerName }) => {
    rooms[roomCode] = { 
      players: [{ id: socket.id, name: playerName, isHost: true }],
      placedCards: [],
      roundStarted: false
    };
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    if (!rooms[roomCode]) {
      socket.emit('roomNotFound');
      return;
    }

    if (rooms[roomCode].players.length >= 10) {
      socket.emit('roomFull');
      return;
    }

    socket.join(roomCode);
    rooms[roomCode].players.push({ id: socket.id, name: playerName, isHost: false });
    io.to(roomCode).emit('playerJoined', { players: rooms[roomCode].players });
  });

  socket.on('startGame', (roomCode) => {
    if (!rooms[roomCode]) return;
    rooms[roomCode].roundStarted = true;
    assignNumbers(roomCode);
    io.to(roomCode).emit('gameStarted');
  });

  socket.on('placeCard', ({ roomCode, number }) => {
    if (!rooms[roomCode] || !rooms[roomCode].roundStarted) return;

    rooms[roomCode].placedCards.push(number);
    const playerCount = rooms[roomCode].players.length;

    if (rooms[roomCode].placedCards.length === playerCount) {
      const sortedCards = [...rooms[roomCode].placedCards].sort((a, b) => a - b);
      const success = JSON.stringify(sortedCards) === JSON.stringify(rooms[roomCode].placedCards);
      io.to(roomCode).emit('roundEnded', { success, placedCards: rooms[roomCode].placedCards });
    } else {
      io.to(roomCode).emit('cardPlaced', rooms[roomCode].placedCards.length);
    }
  });

  socket.on('newRound', (roomCode) => {
    if (!rooms[roomCode]) return;
    rooms[roomCode].placedCards = [];
    assignNumbers(roomCode);
    io.to(roomCode).emit('roundStarted');
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (rooms[room]) {
        rooms[room].players = rooms[room].players.filter(player => player.id !== socket.id);
        if (rooms[room].players.length === 0) {
          delete rooms[room];
        } else {
          io.to(room).emit('playerLeft', { players: rooms[room].players });
        }
      }
    }
  });
});

function assignNumbers(roomCode) {
  const playerCount = rooms[roomCode].players.length;
  const numbers = generateUniqueRandomNumbers(playerCount, 1, 100);
  
  rooms[roomCode].players.forEach((player, index) => {
    io.to(player.id).emit('assignedNumber', numbers[index]);
  });
}

function generateUniqueRandomNumbers(count, min, max) {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers);
}

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
