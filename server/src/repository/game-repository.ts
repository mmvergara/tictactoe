import { ObjectId } from "mongodb";
import { getCurrentTimestamp, getGameSessionsCollection } from "../db/mongo";

export type GameSessionDoc = {
  _id: ObjectId;
  player1Name: string;
  player2Name: string;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  gameHistory: Array<Array<string | null>>;
  moveDescriptions: string[];
  createdAt: string;
  updatedAt: string;
};

export type GameSession = Omit<GameSessionDoc, "_id"> & {
  _id: string;
};

export type CreateGameSessionInput = Omit<
  GameSessionDoc,
  "_id" | "createdAt" | "updatedAt"
>;

export class GameSessionRepo {
  private static docToGameSession(doc: GameSessionDoc): GameSession {
    const { _id, ...rest } = doc;
    return {
      _id: _id.toHexString(),
      ...rest,
    };
  }

  private static toObjectId(id: string | ObjectId): ObjectId {
    if (typeof id === "string") {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId format: ${id}`);
      }
      return new ObjectId(id);
    }
    return id;
  }

  static async create(
    newGameSession: CreateGameSessionInput
  ): Promise<string | null> {
    const gameSessionsCollection = getGameSessionsCollection();
    const now = getCurrentTimestamp();
    const doc: GameSessionDoc = {
      ...newGameSession,
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
    };

    const res = await gameSessionsCollection.insertOne(doc);
    return res.insertedId.toHexString();
  }

  static async findAll(): Promise<GameSession[]> {
    console.log("findAll");
    const gameSessionsCollection = getGameSessionsCollection();

    const gameSessions = await gameSessionsCollection
      .find<GameSessionDoc>({})
      .toArray();

    return gameSessions.map(this.docToGameSession);
  }

  static async findById(
    gameSessionId: string | ObjectId
  ): Promise<GameSession | null> {
    const gameSessionsCollection = getGameSessionsCollection();

    try {
      const objectId = this.toObjectId(gameSessionId);

      const gameSession = await gameSessionsCollection.findOne<GameSessionDoc>({
        _id: objectId,
      });

      if (!gameSession) return null;
      return this.docToGameSession(gameSession);
    } catch (error) {
      return null;
    }
  }

  static async deleteById(gameSessionId: string | ObjectId): Promise<boolean> {
    const gameSessionsCollection = getGameSessionsCollection();

    try {
      const objectId = this.toObjectId(gameSessionId);

      const res = await gameSessionsCollection.deleteOne({ _id: objectId });
      return res.deletedCount === 1;
    } catch (error) {
      return false;
    }
  }
}
