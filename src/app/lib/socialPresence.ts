export type AvatarAction = "idle" | "wave" | "clap" | "raise-hand";
export type AvatarExpression = "focused" | "friendly" | "energized";

export interface SocialPresenceState {
  selectedExpression: AvatarExpression;
  lastAction: AvatarAction;
  updatedAt: string;
}

export const DEFAULT_SOCIAL_PRESENCE: SocialPresenceState = {
  selectedExpression: "focused",
  lastAction: "idle",
  updatedAt: "",
};

const avatarActionList: AvatarAction[] = ["idle", "wave", "clap", "raise-hand"];
const avatarExpressionList: AvatarExpression[] = ["focused", "friendly", "energized"];

export function normalizeAvatarAction(input: unknown): AvatarAction {
  if (typeof input === "string" && avatarActionList.includes(input as AvatarAction)) {
    return input as AvatarAction;
  }

  return DEFAULT_SOCIAL_PRESENCE.lastAction;
}

export function normalizeAvatarExpression(input: unknown): AvatarExpression {
  if (typeof input === "string" && avatarExpressionList.includes(input as AvatarExpression)) {
    return input as AvatarExpression;
  }

  return DEFAULT_SOCIAL_PRESENCE.selectedExpression;
}
