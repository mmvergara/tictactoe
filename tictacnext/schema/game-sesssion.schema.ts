import { z } from "zod";
export const createGameSessionSchema = z.object({
  player1Name: z.string().min(1),
  player2Name: z.string().min(1),
  player1Wins: z.number().int().nonnegative(),
  player2Wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  gameHistory: z.array(z.array(z.string().nullable())),
  moveDescriptions: z.array(z.string()),
});

export type CreateGameSessionInput = z.infer<typeof createGameSessionSchema>;
