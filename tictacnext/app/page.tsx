"use server";
import { getAllGameSessions } from "@/server/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GameSession } from "@/lib/types";
import Link from "next/link";

interface GameSessionCardProps {
  session: GameSession;
}

function GameSessionCard({ session }: GameSessionCardProps) {
  return (
    <Card className="w-full max-w-md text-foreground border-zinc-700 transition-all duration-300 hover:shadow-xl hover:border-primary">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="default"
            className="px-4 py-2 rounded-lg text-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {session.player1Name + " (X)"}
          </Button>
          <span className="text-lg font-semibold text-gray-300">vs</span>
          <Button
            variant="secondary"
            className="px-4 py-2 rounded-lg text-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {session.player2Name + " (O)"}
          </Button>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <p>
            {"Wins: "}
            <span className="font-bold text-foreground">
              {session.player1Wins}
            </span>
            {" (X)"}
          </p>
          <p>
            {"Wins: "}
            <span className="font-bold text-foreground">
              {session.player2Wins}
            </span>
            {" (O)"}
          </p>
          <p>
            {"Draws: "}
            <span className="font-bold text-foreground">{session.draws}</span>
          </p>
        </div>
        <div className="flex justify-center mt-4">
          <Button
            asChild
            variant="outline"
            className="px-4 py-2 rounded-lg text-md font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Link href={`/replay/${session._id}`}>Replay</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const pastSessions = await getAllGameSessions();
  if ("error" in pastSessions) {
    return <div className="text-red-500">{pastSessions.error}</div>;
  }
  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center text-foreground">
        Tic-Tac-Toe
      </h1>
      <Button asChild className="p-10">
        <Link
          className="mb-8 text-xl rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          href="/session"
        >
          Start a New Game
        </Link>
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {pastSessions.map((session, index) => (
          <GameSessionCard key={session._id} session={session} />
        ))}
      </div>
    </div>
  );
}
