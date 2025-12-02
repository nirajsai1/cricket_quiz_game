import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import { connectDb } from "./config/db.js";
import router1 from "./routes/userRoutes.js";
import router2 from "./routes/loginRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/player', router1);
app.use('/', router2);

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

/*
rooms structure:

rooms = {
  "ROOMCODE": {
     players: [
       { socketId, name, score, isCreator: true/false },
       ...
     ],
     currentTurnIndex: 0,
     questionId: 123,
     phase: "primary" | "secondChance" | null,
     timer: <Timeout handle>
  }
}
*/
const rooms = {};

function clearRoomTimer(roomCode) {
  const r = rooms[roomCode];
  if (!r) return;
  if (r.timer) {
    clearTimeout(r.timer);
    r.timer = null;
  }
}

function broadcastScores(roomCode) {
  const r = rooms[roomCode];
  if (!r) return;
  const scores = r.players.map(p => ({ name: p.name, score: p.score }));
  io.to(roomCode).emit("updateScores", { scores });
}

function pickRandomQuestionId() {
  return Math.floor(Math.random() * 336);
}

function startPrimaryTurn(roomCode) {
  const r = rooms[roomCode];
  if (!r) return;
  clearRoomTimer(roomCode);
  r.phase = "primary";
  r.questionId = pickRandomQuestionId();

  const turnIndex = r.currentTurnIndex;
  const turnPlayer = r.players[turnIndex];

  io.to(roomCode).emit("turnStarted", {
    questionId: r.questionId,
    duration: 60,
    currentTurnName: turnPlayer.name,
    currentTurnSocketId: turnPlayer.socketId,
  });

  r.timer = setTimeout(() => {
    r.phase = "primary_timedout";
    io.to(roomCode).emit("primaryTimedOut", { questionId: r.questionId });
    startSecondChance(roomCode);
  }, 60 * 1000);
}

function startSecondChance(roomCode) {
  const r = rooms[roomCode];
  if (!r) return;
  clearRoomTimer(roomCode);
  r.phase = "secondChance";
  const secondIndex = (r.currentTurnIndex + 1) % r.players.length;
  const secondPlayer = r.players[secondIndex];

  io.to(roomCode).emit("secondChanceStarted", {
    questionId: r.questionId,
    duration: 20,
    secondPlayerName: secondPlayer.name,
    secondPlayerSocketId: secondPlayer.socketId
  });

  r.timer = setTimeout(() => {
    r.phase = "round_over";
    io.to(roomCode).emit("roundOver", { reason: "no one answered" });
    r.currentTurnIndex = (r.currentTurnIndex + 1) % r.players.length;
    broadcastScores(roomCode);
    r.timer = setTimeout(() => startPrimaryTurn(roomCode), 1500);
  }, 20 * 1000);
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("createRoom", ({ roomId, name }) => {
    const roomCode = String(roomId).trim().toUpperCase();
    rooms[roomCode] = {
      players: [{ socketId: socket.id, name, score: 0, isCreator: true }],
      currentTurnIndex: 0,
      questionId: null,
      phase: null,
      timer: null,
    };
    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
    console.log(`Room ${roomCode} created by ${name}`);
  });

  socket.on("joinRoom", ({ roomCode, name }) => {
    roomCode = String(roomCode).trim().toUpperCase();
    const r = rooms[roomCode];
    if (!r) {
      socket.emit("roomNotFound");
      console.log("Room not found:", roomCode);
      return;
    }
    if (r.players.length >= 2) {
      socket.emit("roomFull");
      console.log("Room full:", roomCode);
      return;
    }
    r.players.push({ socketId: socket.id, name, score: 0, isCreator: false });
    socket.join(roomCode);

    // notify only the joiner
    socket.emit("roomJoined", roomCode);

    // notify creator separately
    const creator = r.players.find(p => p.isCreator);
    if (creator) {
      io.to(creator.socketId).emit("playerJoined", name);
    }

    console.log(`${name} joined room ${roomCode}`);

    if (r.players.length === 2) {
      const p1 = r.players[0].name;
      const p2 = r.players[1].name;
      const data = {
        roomCode,
        players: { player1: p1, player2: p2 },
        currentTurn: r.players[r.currentTurnIndex].name
      };
      io.to(roomCode).emit("startGame", data);
      broadcastScores(roomCode);
      setTimeout(() => startPrimaryTurn(roomCode), 400);
    }
  });

  // allow a new socket to rejoin and associate with existing player name
  socket.on("rejoinRoom", ({ roomCode, name }) => {
    roomCode = String(roomCode || "").trim().toUpperCase();
    const r = rooms[roomCode];
    if (!r) {
      socket.emit("roomNotFound");
      return;
    }
    // find player by name (case-insensitive)
    const player = r.players.find(p => String(p.name || "").trim().toLowerCase() === String(name || "").trim().toLowerCase());
    if (!player) {
      socket.emit("rejoinFailed");
      return;
    }
    // update socket id and join socket to room so it receives events
    player.socketId = socket.id;
    socket.join(roomCode);

    // send current state to the rejoined socket
    socket.emit("rejoined", {
      roomCode,
      players: r.players.map(p => ({ name: p.name, score: p.score })),
      currentTurn: r.players[r.currentTurnIndex]?.name,
      questionId: r.questionId,
      phase: r.phase
    });

    // ensure UI updates for all connected clients
    broadcastScores(roomCode);
    console.log(`${name} rejoined room ${roomCode} with socket ${socket.id}`);
  });

  // Submit guess handler uses axios to validate correct NAME from /player/data
  socket.on("submitGuess", async ({ roomCode, questionId, guess }) => {
    roomCode = String(roomCode).trim().toUpperCase();
    guess = String(guess || "").trim().toLowerCase();

    const r = rooms[roomCode];
    if (!r) {
      socket.emit("answerResult", { ok: false, reason: "room not found" });
      return;
    }
    if (r.questionId !== questionId) {
      socket.emit("answerResult", { ok: false, reason: "stale question" });
      return;
    }

    const submittingIndex = r.players.findIndex(p => p.socketId === socket.id);
    if (submittingIndex === -1) {
      socket.emit("answerResult", { ok: false, reason: "not in room" });
      return;
    }

    const primaryIdx = r.currentTurnIndex;
    const secondIdx = (primaryIdx + 1) % r.players.length;

    if (r.phase === "primary" && submittingIndex !== primaryIdx) {
      socket.emit("answerResult", { ok: false, reason: "not your turn" });
      return;
    }
    if (r.phase === "secondChance" && submittingIndex !== secondIdx) {
      socket.emit("answerResult", { ok: false, reason: "not second player" });
      return;
    }

    try {
      const res = await axios.post(`http://localhost:${PORT}/player/data`, { id: questionId });
      const realData = res.data || {};
      const correctName = String(realData.NAME || "").trim().toLowerCase();
      const correct = (guess === correctName);

      if (correct) {
        const points = (r.phase === "primary") ? 10 : 5;
        r.players[submittingIndex].score += points;

        io.to(roomCode).emit("answerResult", {
          ok: true,
          scorer: r.players[submittingIndex].name,
          points,
          questionId,
        });

        clearRoomTimer(roomCode);
        broadcastScores(roomCode);

        if (r.players[submittingIndex].score >= 50) {
          io.to(roomCode).emit("gameOver", {
            winner: r.players[submittingIndex].name,
            scores: r.players.map(p => ({ name: p.name, score: p.score }))
          });
          clearRoomTimer(roomCode);
          r.phase = null;
          return;
        }

        r.currentTurnIndex = (r.currentTurnIndex + 1) % r.players.length;
        setTimeout(() => startPrimaryTurn(roomCode), 800);

      } else {
        if (r.phase === "primary") {
          clearRoomTimer(roomCode);
          r.phase = "primary_failed";
          io.to(roomCode).emit("primaryFailed", { questionId, by: r.players[submittingIndex].name });
          startSecondChance(roomCode);
        } else if (r.phase === "secondChance") {
          clearRoomTimer(roomCode);
          io.to(roomCode).emit("secondChanceFailed", { questionId, by: r.players[submittingIndex].name });
          r.currentTurnIndex = (r.currentTurnIndex + 1) % r.players.length;
          broadcastScores(roomCode);
          r.timer = setTimeout(() => startPrimaryTurn(roomCode), 700);
        } else {
          socket.emit("answerResult", { ok: false, reason: "invalid phase" });
        }
      }
    } catch (err) {
      console.error("Error validating answer:", err.message || err);
      socket.emit("answerResult", { ok: false, reason: "server error" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    // keep room data to allow reconnection via rejoinRoom
  });
});

connectDb();
server.listen(PORT, () => {
  console.log(`Server & Socket.IO running on port ${PORT}`);
});