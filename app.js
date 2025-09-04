require("dotenv").config();
require("express-async-errors");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
import notFoundMiddleware from "./middleware/not-found";
const connectDB = require("./config/connect");
import errorHandlerMiddleware from "./middleware/error-handler";
import webRTCSignalingSocket from "./controllers/sockets";

// Import socket handler

const Session = require("./models/session");

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new socketIo(server, {
  cors: {
    origin: "*",
  },
});

//routes
app.post("/create-session", async (req, res) => {
  try {
    const sessionId = Math.random().toString(36).slice(2, 11);
    const session = new Session({ sessionId, participants: [] });
    await session.save();
    res.json({ sessionId });
  } catch (error) {
    console.log(error);
  }
});

app.get("/is-alive", async (req, res) => {
  try {
    const { sessionId } = req.query;
    const session = await Session.findOne({ sessionId });
    res.json({ isAlive: session });
  } catch (error) {
    console.log(error);
  }
});

app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Intialize the WebSocket handling logic
webRTCSignalingSocket(io);

//Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT || 3000, "0.0.0.0", () =>
      console.log(
        `HTTP server is running on port http://localhost:${
          process.env.PORT || 3000
        }`
      )
    );
  } catch (error) {
    console.log(error);
  }
};

start();
