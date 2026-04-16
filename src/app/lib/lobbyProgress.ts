export type LobbyPointId = "training-room" | "team-desk" | "info-kiosk";

export interface LobbyProgress {
  visitedPoints: LobbyPointId[];
  lastLocation: string;
  updatedAt: string;
}

const LOBBY_PROGRESS_STORAGE_KEY = "vr_metaverse_lobby_progress_v1";

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadLobbyProgress(): LobbyProgress {
  if (!hasLocalStorage()) {
    return { visitedPoints: [], lastLocation: "Main Entrance", updatedAt: "" };
  }

  const raw = window.localStorage.getItem(LOBBY_PROGRESS_STORAGE_KEY);
  if (!raw) {
    return { visitedPoints: [], lastLocation: "Main Entrance", updatedAt: "" };
  }

  try {
    const parsed = JSON.parse(raw) as LobbyProgress;
    return {
      visitedPoints: Array.isArray(parsed.visitedPoints) ? parsed.visitedPoints : [],
      lastLocation: parsed.lastLocation || "Main Entrance",
      updatedAt: parsed.updatedAt || "",
    };
  } catch {
    return { visitedPoints: [], lastLocation: "Main Entrance", updatedAt: "" };
  }
}

export function saveLobbyProgress(progress: LobbyProgress) {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(LOBBY_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}
