"use server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getGameSessionById } from "@/server/actions";
import { Button } from "@/components/ui/button";

function MiniBoard({ squares }: { squares: Array<string | null> }) {
  return (
    <div className="grid grid-cols-3 gap-1 w-28 h-28 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      {squares.map((value, i) => (
        <div
          key={i}
          className="w-full h-full bg-card text-card-foreground text-base font-bold flex items-center justify-center border border-border"
        >
          {value || "-"}
        </div>
      ))}
    </div>
  );
}

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const replayingSession = await getGameSessionById(id);
  if ("error" in replayingSession) {
    return <div>Error: {replayingSession.error}</div>;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-2 py-8">
      <Card className="w-full max-w-2xl p-8 bg-card text-card-foreground border-border shadow-lg">
        <CardHeader className="mb-2">
          <CardTitle className="text-center text-3xl font-bold text-card-foreground mb-2">
            Replaying Session
          </CardTitle>
          <p className="text-center text-xl text-muted-foreground mb-1">
            {replayingSession.player1Name} (X) vs {replayingSession.player2Name}{" "}
            (O)
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-10 px-0">
          <div className="max-h-[400px] overflow-y-auto w-full">
            {/* Scrollable area for moves */}
            <ol className="space-y-6">
              {replayingSession.gameHistory.map((squares, moveIndex) => (
                <li
                  key={moveIndex}
                  className="flex items-center gap-6 p-4 border border-border rounded-lg bg-accent/60 shadow-sm"
                >
                  <MiniBoard squares={squares} />
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-accent-foreground leading-relaxed">
                      {replayingSession.moveDescriptions[moveIndex]}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <Button
            asChild
            variant="secondary"
            className="py-3 px-8 text-lg mt-4 self-center"
          >
            <Link href="/">Exit Replay</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
