import { GraduationCap, Info, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LobbyPointId } from "./lobbyProgress";

export interface LobbyInteractionPoint {
  id: LobbyPointId;
  label: string;
  shortLabel: string;
  description: string;
  locationLabel: string;
  icon: LucideIcon;
  positionClass: string;
  mapX: number;
  mapY: number;
}

export const lobbyInteractionPoints: LobbyInteractionPoint[] = [
  {
    id: "training-room",
    label: "Training Room",
    shortLabel: "TR",
    description: "Review core controls and complete your immersive workspace tutorial.",
    locationLabel: "Training Room",
    icon: GraduationCap,
    positionClass: "top-[28%] left-[24%]",
    mapX: 30,
    mapY: 30,
  },
  {
    id: "team-desk",
    label: "Team Desk",
    shortLabel: "TD",
    description: "Check in with teammates, assign roles, and sync your first sprint goals.",
    locationLabel: "Team Desk",
    icon: Users,
    positionClass: "top-[46%] left-1/2 -translate-x-1/2",
    mapX: 55,
    mapY: 45,
  },
  {
    id: "info-kiosk",
    label: "Info Kiosk",
    shortLabel: "IK",
    description: "Access company updates, onboarding FAQs, and quick-start knowledge docs.",
    locationLabel: "Info Kiosk",
    icon: Info,
    positionClass: "top-[34%] right-[22%]",
    mapX: 72,
    mapY: 32,
  },
];

export const lobbyPointOrder: LobbyPointId[] = lobbyInteractionPoints.map((point) => point.id);

export const lobbyPointLabels: Record<LobbyPointId, string> = {
  "training-room": "Training Room",
  "team-desk": "Team Desk",
  "info-kiosk": "Info Kiosk",
};

export const lobbyCoreUnlockPointIds: LobbyPointId[] = ["training-room", "team-desk"];

export const socialTipsByPoint: Record<LobbyPointId, string> = {
  "training-room": "Complete training to unlock shared voice controls and etiquette guidance.",
  "team-desk": "Meet team members to activate paired conversation channels.",
  "info-kiosk": "Check info kiosk updates to sync discussion context before collaboration.",
};

export function isLobbyCoreComplete(visitedPoints: LobbyPointId[]) {
  return lobbyCoreUnlockPointIds.every((pointId) => visitedPoints.includes(pointId));
}
