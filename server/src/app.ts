import express, { Router } from "express";
import { errorHandler } from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import { connectToMongoDB } from "./db/mongo";
import {
  GameSessionRepo,
  CreateGameSessionInput,
} from "./repository/game-repository";
import { z } from "zod";

const app = express();

app.use(express.json());
app.use(cookieParser());

const router = Router();

const createGameSessionSchema = z.object({
  player1Name: z.string().min(1),
  player2Name: z.string().min(1),
  player1Wins: z.number().int().nonnegative(),
  player2Wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  gameHistory: z.array(z.array(z.string().nullable())),
  moveDescriptions: z.array(z.string()),
});

router.get("/hello", (req, res) => {
  console.log("hello");
  res.json({ message: "Hello, world!" });
});

router.get("/game-session", async (req, res) => {
  try {
    const gameSessions = await GameSessionRepo.findAll();
    console.log(gameSessions);
    res.json(gameSessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game sessions" });
  }
});

router.post("/game-session", async (req, res) => {
  try {
    const parseResult = createGameSessionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.issues });
    }
    console.log(parseResult.data);
    const gameSession = await GameSessionRepo.create(
      parseResult.data as CreateGameSessionInput
    );
    res.status(201).json({ id: gameSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create game session" });
  }
});

router.get("/game-session/:id", async (req, res) => {
  try {
    const gameSession = await GameSessionRepo.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({ error: "Game session not found" });
    }
    res.json(gameSession);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game session" });
  }
});

router.delete("/game-session/:id", async (req, res) => {
  try {
    const deleted = await GameSessionRepo.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Game session not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete game session" });
  }
});

app.use("/api/v1", router);
app.use(errorHandler);

export default app;
