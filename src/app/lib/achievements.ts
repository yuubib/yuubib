import type { LobbyPointId } from "./lobbyProgress";
import type { AvatarAction, AvatarExpression } from "./socialPresence";

export type AchievementBadgeId =
  | "identity-pass"
  | "training-scout"
  | "team-synergy"
  | "knowledge-miner"
  | "district-unlock"
  | "social-signal"
  | "emotion-caster"
  | "metaverse-pioneer";

export interface AchievementProgressInput {
  onboardingCompleted: boolean;
  visitedPoints: LobbyPointId[];
  lobbyCoreCompleted: boolean;
  lastAction: AvatarAction;
  selectedExpression: AvatarExpression;
}

export interface AchievementBadge {
  id: AchievementBadgeId;
  emoji: string;
  title: string;
  description: string;
  unlockHint: string;
  unlocked: boolean;
}

function hasVisitedPoint(visitedPoints: LobbyPointId[], pointId: LobbyPointId) {
  return visitedPoints.includes(pointId);
}

export function resolveAchievementBadges(input: AchievementProgressInput): AchievementBadge[] {
  const onboardingReady = input.onboardingCompleted;
  const visitedTraining = hasVisitedPoint(input.visitedPoints, "training-room");
  const visitedTeamDesk = hasVisitedPoint(input.visitedPoints, "team-desk");
  const visitedInfoKiosk = hasVisitedPoint(input.visitedPoints, "info-kiosk");
  const socialActionUsed = input.lastAction !== "idle";
  const expressionChanged = input.selectedExpression !== "focused";

  return [
    {
      id: "identity-pass",
      emoji: "🪪",
      title: "Identity Pass",
      description: "Completed onboarding identity setup.",
      unlockHint: "Complete onboarding profile.",
      unlocked: onboardingReady,
    },
    {
      id: "training-scout",
      emoji: "🧭",
      title: "Training Scout",
      description: "Visited the Training Room node.",
      unlockHint: "Visit Training Room in Lobby.",
      unlocked: visitedTraining,
    },
    {
      id: "team-synergy",
      emoji: "🤝",
      title: "Team Synergy",
      description: "Connected with Team Desk collaboration space.",
      unlockHint: "Visit Team Desk in Lobby.",
      unlocked: visitedTeamDesk,
    },
    {
      id: "knowledge-miner",
      emoji: "📚",
      title: "Knowledge Miner",
      description: "Activated the Info Kiosk knowledge stream.",
      unlockHint: "Visit Info Kiosk in Lobby.",
      unlocked: visitedInfoKiosk,
    },
    {
      id: "district-unlock",
      emoji: "🚪",
      title: "District Unlock",
      description: "Unlocked Social and History districts.",
      unlockHint: "Finish key Lobby tasks (Training + Team Desk).",
      unlocked: input.lobbyCoreCompleted,
    },
    {
      id: "social-signal",
      emoji: "👋",
      title: "Social Signal",
      description: "Performed an avatar action in Social Hub.",
      unlockHint: "Use Wave / Clap / Raise Hand in Social Hub.",
      unlocked: socialActionUsed,
    },
    {
      id: "emotion-caster",
      emoji: "😊",
      title: "Emotion Caster",
      description: "Switched to a custom avatar expression mode.",
      unlockHint: "Set expression to Friendly or Energized.",
      unlocked: expressionChanged,
    },
    {
      id: "metaverse-pioneer",
      emoji: "🏆",
      title: "Metaverse Pioneer",
      description: "Completed core onboarding, exploration, and social expression.",
      unlockHint: "Unlock all core badges above.",
      unlocked:
        onboardingReady &&
        visitedTraining &&
        visitedTeamDesk &&
        visitedInfoKiosk &&
        socialActionUsed &&
        expressionChanged,
    },
  ];
}
