require("dotenv").config();
const connectDB = require("./config/connect");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Session = require("./models/session");
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

//routes
app.post("/create-session", async (req, res) => {
  try {
    const sessionId = Math.random().toString().substr(2, 9);
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
