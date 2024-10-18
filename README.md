# Silent Sequence

Silent Sequence is a multiplayer card game where players must place their cards in ascending order without communicating. This digital version allows players to join rooms and play together online.

## How to Play

https://number-game-vt3g.onrender.com

1. Create a room or join an existing one using a room code.
2. Wait for all players to join (up to 10 players).
3. The host starts the game.
4. Each player receives a unique number between 1 and 100.
5. Players must place their cards in ascending order without communicating.
6. Once all cards are placed, the game reveals if the sequence was correct.
7. Start a new round to play again!

## Setup and Deployment

1. Ensure you have Node.js installed on your system.
2. Clone this repository.
3. Run `npm install` to install dependencies.
4. Start the server with `node server.js`.
5. Access the game at `http://localhost:3000` in your web browser.

To deploy on Render.com:

1. Push your code to a Git repository.
2. Create a new Web Service on Render.
3. Connect your repository and use the following settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`

## Technologies Used

- Node.js
- Express.js
- Socket.IO
- Bootstrap 5

## License

This project is open source and available under the [MIT License](LICENSE).
