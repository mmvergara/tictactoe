"use server";

import { redirect } from "next/navigation";
import { GameSession } from "../lib/types";
import {
  CreateGameSessionInput,
  createGameSessionSchema,
} from "../schema/game-sesssion.schema";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001/api/v1";

export async function createGameSession(input: CreateGameSessionInput) {
  const parseResult = createGameSessionSchema.safeParse(input);
  if (!parseResult.success) {
    return { error: "Invalid input", details: parseResult.error.issues };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/game-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parseResult.data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return {
        error: error.error || "Failed to create game session",
        details: error.details,
      };
    }
  } catch (e) {
    return { error: "Network error" };
  }
  redirect("/");
}

export async function getAllGameSessions() {
  try {
    const res = await fetch(`${API_BASE_URL}/game-session`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { error: "Failed to fetch game sessions" };
    }
    return (await res.json()) as GameSession[];
  } catch (e) {
    console.error(e);
    return { error: "Network error" };
  }
}

export async function getGameSessionById(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/game-session/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { error: "Game session not found" };
    }
    return (await res.json()) as GameSession;
  } catch (e) {
    return { error: "Network error" };
  }
}

export async function deleteGameSession(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/game-session/${id}`, {
      method: "DELETE",
    });
    if (res.status === 204) {
      return { success: true };
    }
    if (res.status === 404) {
      return { error: "Game session not found" };
    }
    return { error: "Failed to delete game session" };
  } catch (e) {
    return { error: "Network error" };
  }
}
