export type GameSession = {
  _id?: string;
  player1Name: string;
  player2Name: string;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  gameHistory: Array<Array<string | null>>; // Array of board states after each move
  moveDescriptions: string[]; // Array of descriptions for each move
};
