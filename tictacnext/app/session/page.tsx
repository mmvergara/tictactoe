"use client";

import { startTransition, useEffect } from "react";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GameSession } from "@/lib/types";
import { createGameSession } from "../../server/actions";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, PartyPopper, Smile, User, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

function calculateWinner(squares: Array<string | null>): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// Square component represents a single cell on the board
function Square({
  value,
  onSquareClick,
}: {
  value: string | null;
  onSquareClick: () => void;
}) {
  return (
    <button
      className={`w-24 h-24 bg-accent border text-5xl font-bold flex items-center justify-center rounded-md hover:bg-accent/80 transition-colors hover:cursor-pointer`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

// Board component manages the 3x3 grid and game status
function Board({
  xIsNext,
  squares,
  onPlay,
  player1Name,
  player2Name,
}: {
  xIsNext: boolean;
  squares: Array<string | null>;
  onPlay: (nextSquares: Array<string | null>, clickedIndex: number) => void; // Changed signature
  player1Name: string;
  player2Name: string;
}) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares, i); // Pass 'i' here
  }

  const winner = calculateWinner(squares);
  let status: string;
  if (winner) {
    status = `Winner: ${winner === "X" ? player1Name : player2Name}`;
  } else if (squares.every(Boolean)) {
    // Check for draw if all squares are filled and no winner
    status = "Draw!";
  } else {
    status = `Next player: ${xIsNext ? player1Name : player2Name} (${
      xIsNext ? "X" : "O"
    })`;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-semibold" aria-live="polite">
        {status}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Square
            key={i}
            value={squares[i]}
            onSquareClick={() => handleClick(i)}
          />
        ))}
      </div>
    </div>
  );
}

// Main Game component manages the overall game session and rounds
export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [history, setHistory] = useState<Array<Array<string | null>>>([
    Array(9).fill(null),
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [roundOver, setRoundOver] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    player1Wins: 0,
    player2Wins: 0,
    draws: 0,
  });
  const [currentRoundWinner, setCurrentRoundWinner] = useState<string | null>(
    null
  ); // 'X', 'O', 'Draw', or null
  const [loading, setLoading] = useState(false); // For button loading states
  const [replayingSession, setReplayingSession] = useState<GameSession | null>(
    null
  ); // Stores the session being replayed
  const [currentRoundMoveDescriptions, setCurrentRoundMoveDescriptions] =
    useState<string[]>(["Game Start"]); // Descriptions for the current round's moves

  // Effect to check for winner or draw after each move
  useEffect(() => {
    if (replayingSession) return;
    const winner = calculateWinner(currentSquares);
    const isDraw = currentSquares.every(Boolean) && !winner;
    if (winner || isDraw) {
      setRoundOver(true);
      if (winner === "X") {
        setSessionStats((prev) => ({
          ...prev,
          player1Wins: prev.player1Wins + 1,
        }));
        setCurrentRoundWinner("X");
        toast.success(`${player1Name} wins this round! 🏆`, {
          icon: <Trophy className="text-yellow-500" />,
        }); // Emotional celebratory feedback
      } else if (winner === "O") {
        setSessionStats((prev) => ({
          ...prev,
          player2Wins: prev.player2Wins + 1,
        }));
        setCurrentRoundWinner("O");
        toast.success(`${player2Name} wins this round! 🎉`, {
          icon: <PartyPopper className="text-pink-500" />,
        }); // Emotional celebratory feedback
      } else if (isDraw) {
        setSessionStats((prev) => ({ ...prev, draws: prev.draws + 1 }));
        setCurrentRoundWinner("Draw");
        toast("It's a draw! 🤝", {
          icon: <Smile className="text-blue-500" />,
        }); // Emotional feedback for draw
      }
    }
  }, [currentSquares, replayingSession, player1Name, player2Name]);

  // Handles a player's move, updating the game history and move descriptions
  function handlePlay(
    nextSquares: Array<string | null>,
    clickedSquareIndex: number
  ) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const player = xIsNext ? player1Name : player2Name;
    const marker = xIsNext ? "X" : "O";
    const row = Math.floor(clickedSquareIndex / 3);
    const col = clickedSquareIndex % 3;
    const description = `${player} (${marker}) picked (${row}, ${col})`;
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setCurrentRoundMoveDescriptions((prev) => [
      ...prev.slice(0, currentMove + 1),
      description,
    ]);
  }

  // Initiates a new game session, resetting all session and round data
  function handleStartGameSession() {
    setGameStarted(true);
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setRoundOver(false);
    setSessionStats({ player1Wins: 0, player2Wins: 0, draws: 0 });
    setCurrentRoundWinner(null);
    setReplayingSession(null);
    setCurrentRoundMoveDescriptions(["Game Start"]);
  }

  // Ends the current game session and returns to the name input screen
  function handleStopGameSession() {
    setLoading(true);
    const newSession: GameSession = {
      player1Name,
      player2Name,
      player1Wins: sessionStats.player1Wins,
      player2Wins: sessionStats.player2Wins,
      draws: sessionStats.draws,
      gameHistory: history,
      moveDescriptions: currentRoundMoveDescriptions,
    };
    startTransition(async () => {
      const res = await createGameSession(newSession);
      setLoading(false);
      if ("error" in res) {
        toast.error(res.error, { icon: <User className="text-red-500" /> });
      } else {
        toast.success("Session saved!", {
          icon: <Users className="text-green-500" />,
        });
        setGameStarted(false); // Return to name input screen
      }
    });
  }

  // Function to handle continuing the round
  function handleContinueRound() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setRoundOver(false);
    setCurrentRoundWinner(null);
    setCurrentRoundMoveDescriptions(["Game Start"]);
  }

  // Empty state with playful microcopy and icon
  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/30 px-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="w-full max-w-lg shadow-2xl p-10 border border-border bg-card/90 rounded-2xl overflow-hidden"
        >
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="player1"
                className="text-base font-semibold text-foreground flex items-center gap-1"
              >
                <User className="w-4 h-4 text-primary" /> Player 1{" "}
                <Badge variant="secondary">X</Badge>
              </Label>
              <Input
                id="player1"
                placeholder="Enter Player 1's name"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="text-base p-2 bg-muted/50 border border-input focus-visible:ring-primary rounded-lg"
                aria-label="Player 1 Name"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="player2"
                className="text-base font-semibold text-foreground flex items-center gap-1"
              >
                <User className="w-4 h-4 text-primary" /> Player 2{" "}
                <Badge variant="secondary">O</Badge>
              </Label>
              <Input
                id="player2"
                placeholder="Enter Player 2's name"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="text-base p-2 bg-muted/50 border border-input focus-visible:ring-accent rounded-lg"
                aria-label="Player 2 Name"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-10">
            <Button
              onClick={handleStartGameSession}
              disabled={!player1Name || !player2Name || loading}
              className="w-full py-3 text-lg shadow-md transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/70"
              variant="default"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Start Game Session
            </Button>
            <div className="text-center text-muted-foreground text-xs mt-2">
              <Smile className="inline w-4 h-4 mr-1 text-primary" />
              Tip: Give your players fun nicknames!
            </div>
          </CardFooter>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/30 px-2">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="w-full max-w-2xl p-6 rounded-2xl shadow-2xl border border-border bg-card/90"
      >
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-center text-3xl font-bold flex items-center gap-2">
            <Trophy
              className="w-7 h-7 text-yellow-400 drop-shadow-glow animate-glow"
              aria-hidden
            />
            Tic-Tac-Toe
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="w-full"
          >
            <Board
              xIsNext={xIsNext}
              squares={currentSquares}
              onPlay={handlePlay}
              player1Name={player1Name}
              player2Name={player2Name}
            />
          </motion.div>
          <AnimatePresence>
            {roundOver && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="mt-4 text-center space-y-4"
              >
                <p
                  className="text-2xl font-bold flex items-center justify-center gap-2"
                  aria-live="polite"
                >
                  {currentRoundWinner === "X" && (
                    <>
                      <Trophy className="text-yellow-500 animate-glow" />{" "}
                      {player1Name} (X) wins this round! 🎉
                    </>
                  )}
                  {currentRoundWinner === "O" && (
                    <>
                      <PartyPopper className="text-pink-500 animate-glow" />{" "}
                      {player2Name} (O) wins this round! 🎊
                    </>
                  )}
                  {currentRoundWinner === "Draw" && (
                    <>
                      <Smile className="text-blue-500 animate-glow" /> This
                      round is a Draw!
                    </>
                  )}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleContinueRound}
                    className="py-3 px-6 text-lg shadow-md transition-transform hover:scale-105"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={handleStopGameSession}
                    variant="outline"
                    className="py-3 px-6 text-lg bg-transparent shadow-md transition-transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    End Session
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-6 w-full text-center">
            <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Session Score
            </h2>
            <div className="flex flex-col gap-4 text-lg">
              <p>
                {player1Name} (X) Wins:{" "}
                <span className="font-bold text-primary">
                  {sessionStats.player1Wins}
                </span>
              </p>
              <p>
                {player2Name} (O) Wins:{" "}
                <span className="font-bold text-accent">
                  {sessionStats.player2Wins}
                </span>
              </p>
              <p>
                Draws:{" "}
                <span className="font-bold text-muted-foreground">
                  {sessionStats.draws}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
}

// --- Emotional Design Suggestions for Further Enhancement ---
// 1. Add confetti animation (e.g., react-confetti) for round wins.
// 2. Animate board squares with springy feedback on click.
// 3. Add progress indicator for session rounds.
// 4. Use sound effects for moves and wins.
// 5. Add a playful mascot or avatar for each player.
// 6. Implement a "replay last round" feature with animated playback.
// 7. Add accessibility live regions for all status updates.
// 8. Use more microcopy for encouragement and tips.
// 9. Add dark mode toggle with animated transition.
// 10. Celebrate milestones (e.g., 3 wins in a row) with special toasts.
// ----------------------------------------------------------
