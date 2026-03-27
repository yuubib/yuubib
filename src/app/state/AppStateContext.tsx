import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { previousStepRouteMap, type AppRouteKey } from "../lib/flow";
import { type EmployeeProfile, loadEmployeeProfile, saveEmployeeProfile } from "../lib/profile";
import { type LobbyPointId, type LobbyProgress, loadLobbyProgress, saveLobbyProgress } from "../lib/lobbyProgress";
import { isLobbyCoreComplete, lobbyPointOrder } from "../lib/lobbyContent";
import {
  DEFAULT_SOCIAL_PRESENCE,
  normalizeAvatarAction,
  normalizeAvatarExpression,
  type AvatarAction,
  type AvatarExpression,
  type SocialPresenceState,
} from "../lib/socialPresence";

const APP_STATE_STORAGE_KEY = "vr_metaverse_app_state_v2";

const DEFAULT_LOBBY_PROGRESS: LobbyProgress = {
  visitedPoints: [],
  lastLocation: "Main Entrance",
  updatedAt: "",
};

const ROUTE_ORDER: AppRouteKey[] = ["root", "onboarding", "lobby", "social", "history"];
const ALWAYS_UNLOCKED_ROUTES: AppRouteKey[] = ["root", "onboarding"];

interface PersistedAppState {
  profile: EmployeeProfile | null;
  lobbyProgress: LobbyProgress;
  socialPresence: SocialPresenceState;
  lastVisitedRoute: AppRouteKey;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: "success" | "info" | "warning";
}

interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastMessage["tone"];
  durationMs?: number;
}

interface AppStateContextValue {
  profile: EmployeeProfile | null;
  lobbyProgress: LobbyProgress;
  socialPresence: SocialPresenceState;
  onboardingCompleted: boolean;
  lobbyCoreCompleted: boolean;
  unlockedRoutes: AppRouteKey[];
  continueRoute: AppRouteKey;
  lastVisitedRoute: AppRouteKey;
  canAccessRoute: (route: AppRouteKey) => boolean;
  getPreviousStepRoute: (route: AppRouteKey) => AppRouteKey;
  setLastVisitedRoute: (route: AppRouteKey) => void;
  completeOnboarding: (profile: Omit<EmployeeProfile, "createdAt"> & { createdAt?: string }) => void;
  visitLobbyPoint: (pointId: LobbyPointId, locationLabel: string) => void;
  setAvatarExpression: (expression: AvatarExpression) => void;
  setAvatarLastAction: (action: AvatarAction) => void;
  toasts: ToastMessage[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sanitizeRoute(route: unknown, fallback: AppRouteKey): AppRouteKey {
  if (typeof route === "string" && ROUTE_ORDER.includes(route as AppRouteKey)) {
    return route as AppRouteKey;
  }
  return fallback;
}

function sanitizeLobbyProgress(raw: unknown): LobbyProgress {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_LOBBY_PROGRESS;
  }

  const validPointIds = new Set<LobbyPointId>(lobbyPointOrder);
  const value = raw as Partial<LobbyProgress>;
  const visitedPoints: LobbyPointId[] = [];

  if (Array.isArray(value.visitedPoints)) {
    value.visitedPoints.forEach((point) => {
      if (typeof point === "string") {
        const typedPoint = point as LobbyPointId;
        if (validPointIds.has(typedPoint) && !visitedPoints.includes(typedPoint)) {
          visitedPoints.push(typedPoint);
        }
      }
    });
  }

  return {
    visitedPoints,
    lastLocation: typeof value.lastLocation === "string" && value.lastLocation
      ? value.lastLocation
      : DEFAULT_LOBBY_PROGRESS.lastLocation,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function sanitizeProfile(raw: unknown): EmployeeProfile | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const value = raw as Partial<EmployeeProfile>;
  if (typeof value.employeeName !== "string" || typeof value.roleId !== "string") {
    return null;
  }

  return {
    employeeName: value.employeeName,
    roleId: value.roleId,
    roleTitle: typeof value.roleTitle === "string" ? value.roleTitle : "",
    department: typeof value.department === "string" ? value.department : "",
    skillTags: Array.isArray(value.skillTags)
      ? value.skillTags.filter((tag): tag is string => typeof tag === "string")
      : [],
    avatarIndex: typeof value.avatarIndex === "number" ? value.avatarIndex : 0,
    avatarLabel: typeof value.avatarLabel === "string" ? value.avatarLabel : "Avatar",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
  };
}

function sanitizeSocialPresence(raw: unknown): SocialPresenceState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_SOCIAL_PRESENCE;
  }

  const value = raw as Partial<SocialPresenceState>;
  return {
    selectedExpression: normalizeAvatarExpression(value.selectedExpression),
    lastAction: normalizeAvatarAction(value.lastAction),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function isProfileComplete(profile: EmployeeProfile | null) {
  return Boolean(profile?.employeeName?.trim() && profile?.roleId?.trim());
}

function deriveUnlockedRoutes(profile: EmployeeProfile | null, lobbyProgress: LobbyProgress) {
  const unlocked = new Set<AppRouteKey>(ALWAYS_UNLOCKED_ROUTES);

  if (isProfileComplete(profile)) {
    unlocked.add("lobby");
  }

  if (isLobbyCoreComplete(lobbyProgress.visitedPoints)) {
    unlocked.add("social");
    unlocked.add("history");
  }

  return ROUTE_ORDER.filter((route) => unlocked.has(route));
}

function deriveContinueRoute(
  onboardingCompleted: boolean,
  lobbyCoreCompleted: boolean,
  lastVisitedRoute: AppRouteKey,
  unlockedRoutes: AppRouteKey[]
): AppRouteKey {
  const unlockedSet = new Set(unlockedRoutes);

  if (!onboardingCompleted) {
    return "onboarding";
  }

  if (!lobbyCoreCompleted) {
    return "lobby";
  }

  if (lastVisitedRoute !== "root" && unlockedSet.has(lastVisitedRoute)) {
    return lastVisitedRoute;
  }

  return unlockedSet.has("social") ? "social" : "lobby";
}

function loadPersistedState(): PersistedAppState {
  const fallbackState: PersistedAppState = {
    profile: loadEmployeeProfile(),
    lobbyProgress: loadLobbyProgress(),
    socialPresence: DEFAULT_SOCIAL_PRESENCE,
    lastVisitedRoute: "root",
    updatedAt: "",
  };

  if (!hasLocalStorage()) {
    return fallbackState;
  }

  const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
  if (!raw) {
    return fallbackState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    return {
      profile: sanitizeProfile(parsed.profile) ?? fallbackState.profile,
      lobbyProgress: sanitizeLobbyProgress(parsed.lobbyProgress ?? fallbackState.lobbyProgress),
      socialPresence: sanitizeSocialPresence(parsed.socialPresence),
      lastVisitedRoute: sanitizeRoute(parsed.lastVisitedRoute, fallbackState.lastVisitedRoute),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return fallbackState;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedAppState>(() => loadPersistedState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimeoutMapRef = useRef(new Map<string, number>());

  const onboardingCompleted = useMemo(() => isProfileComplete(state.profile), [state.profile]);
  const lobbyCoreCompleted = useMemo(
    () => isLobbyCoreComplete(state.lobbyProgress.visitedPoints),
    [state.lobbyProgress.visitedPoints]
  );

  const unlockedRoutes = useMemo(
    () => deriveUnlockedRoutes(state.profile, state.lobbyProgress),
    [state.profile, state.lobbyProgress]
  );

  const continueRoute = useMemo(
    () => deriveContinueRoute(onboardingCompleted, lobbyCoreCompleted, state.lastVisitedRoute, unlockedRoutes),
    [onboardingCompleted, lobbyCoreCompleted, state.lastVisitedRoute, unlockedRoutes]
  );

  useEffect(() => {
    if (!hasLocalStorage()) {
      return;
    }

    window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));

    if (state.profile) {
      saveEmployeeProfile(state.profile);
    }

    saveLobbyProgress(state.lobbyProgress);
  }, [state]);

  useEffect(() => {
    return () => {
      toastTimeoutMapRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      toastTimeoutMapRef.current.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutId = toastTimeoutMapRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutMapRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    ({ title, description, tone = "info", durationMs = 2600 }: ToastInput) => {
      const toastId = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      setToasts((current) => [...current, { id: toastId, title, description, tone }]);

      if (durationMs > 0 && typeof window !== "undefined") {
        const timeoutId = window.setTimeout(() => {
          dismissToast(toastId);
        }, durationMs);
        toastTimeoutMapRef.current.set(toastId, timeoutId);
      }

      return toastId;
    },
    [dismissToast]
  );

  const canAccessRoute = useCallback(
    (route: AppRouteKey) => unlockedRoutes.includes(route),
    [unlockedRoutes]
  );

  const getPreviousStepRoute = useCallback(
    (route: AppRouteKey) => {
      const unlockedSet = new Set(unlockedRoutes);
      const previousRoute = previousStepRouteMap[route];

      if (unlockedSet.has(previousRoute)) {
        return previousRoute;
      }

      if (unlockedSet.has("onboarding")) {
        return "onboarding";
      }

      return "root";
    },
    [unlockedRoutes]
  );

  const setLastVisitedRoute = useCallback((route: AppRouteKey) => {
    setState((current) => {
      if (current.lastVisitedRoute === route) {
        return current;
      }

      return {
        ...current,
        lastVisitedRoute: route,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const completeOnboarding = useCallback(
    (profileInput: Omit<EmployeeProfile, "createdAt"> & { createdAt?: string }) => {
      setState((current) => ({
        ...current,
        profile: {
          ...profileInput,
          createdAt: profileInput.createdAt || current.profile?.createdAt || new Date().toISOString(),
        },
        lastVisitedRoute: "lobby",
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  const visitLobbyPoint = useCallback((pointId: LobbyPointId, locationLabel: string) => {
    setState((current) => {
      const hasVisited = current.lobbyProgress.visitedPoints.includes(pointId);
      const visitedPoints = hasVisited
        ? current.lobbyProgress.visitedPoints
        : [...current.lobbyProgress.visitedPoints, pointId];

      return {
        ...current,
        lobbyProgress: {
          visitedPoints,
          lastLocation: locationLabel,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const setAvatarExpression = useCallback((expression: AvatarExpression) => {
    setState((current) => {
      if (current.socialPresence.selectedExpression === expression) {
        return current;
      }

      return {
        ...current,
        socialPresence: {
          ...current.socialPresence,
          selectedExpression: expression,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const setAvatarLastAction = useCallback((action: AvatarAction) => {
    setState((current) => ({
      ...current,
      socialPresence: {
        ...current.socialPresence,
        lastAction: action,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const contextValue = useMemo<AppStateContextValue>(
    () => ({
      profile: state.profile,
      lobbyProgress: state.lobbyProgress,
      socialPresence: state.socialPresence,
      onboardingCompleted,
      lobbyCoreCompleted,
      unlockedRoutes,
      continueRoute,
      lastVisitedRoute: state.lastVisitedRoute,
      canAccessRoute,
      getPreviousStepRoute,
      setLastVisitedRoute,
      completeOnboarding,
      visitLobbyPoint,
      setAvatarExpression,
      setAvatarLastAction,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      state.profile,
      state.lobbyProgress,
      state.socialPresence,
      state.lastVisitedRoute,
      onboardingCompleted,
      lobbyCoreCompleted,
      unlockedRoutes,
      continueRoute,
      canAccessRoute,
      getPreviousStepRoute,
      setLastVisitedRoute,
      completeOnboarding,
      visitLobbyPoint,
      setAvatarExpression,
      setAvatarLastAction,
      toasts,
      pushToast,
      dismissToast,
    ]
  );

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }

  return context;
}
