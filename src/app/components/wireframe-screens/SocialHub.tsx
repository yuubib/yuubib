import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Mic, Volume2, Users, ArrowLeft, Radio, Hand, Sparkles, ArrowUp, Smile, Shield, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { StateMessage } from "../app/StateMessage";
import { routePathMap } from "../../lib/flow";
import { lobbyPointLabels, lobbyPointOrder, socialTipsByPoint } from "../../lib/lobbyContent";
import { MOTION } from "../../lib/motion";
import { navigateWithTransition } from "../../lib/navigation";
import type { AvatarAction, AvatarExpression } from "../../lib/socialPresence";
import { useAppState } from "../../state/AppStateContext";

interface ConnectionState {
  title: string;
  hint: string;
  level: "locked" | "warming" | "ready";
  audioStatus: string;
  communicationStatus: string;
}

interface AvatarActionOption {
  id: AvatarAction;
  label: string;
  hotkey: string;
  icon: LucideIcon;
  description: string;
}

interface AvatarExpressionOption {
  id: AvatarExpression;
  label: string;
  hotkey: string;
  icon: LucideIcon;
  description: string;
}

const avatarActionOptions: AvatarActionOption[] = [
  { id: "wave", label: "Wave", hotkey: "1", icon: Hand, description: "Friendly greeting nearby teammates." },
  { id: "clap", label: "Clap", hotkey: "2", icon: Sparkles, description: "Celebrate a win or show support." },
  { id: "raise-hand", label: "Raise Hand", hotkey: "3", icon: ArrowUp, description: "Request speaking turn." },
];

const avatarExpressionOptions: AvatarExpressionOption[] = [
  { id: "focused", label: "Focused", hotkey: "Q", icon: Shield, description: "Calm, task-oriented posture." },
  { id: "friendly", label: "Friendly", hotkey: "W", icon: Smile, description: "Warm social presence." },
  { id: "energized", label: "Energized", hotkey: "E", icon: Zap, description: "High-energy collaboration mode." },
];

interface EmojiBurst {
  id: string;
  emoji: string;
  source: "user" | "peer";
  driftX: number;
}

const actionEmojiMap: Record<AvatarAction, string> = {
  idle: "💬",
  wave: "👋",
  clap: "👏",
  "raise-hand": "🙋",
};

const expressionEmojiMap: Record<AvatarExpression, string> = {
  focused: "🧠",
  friendly: "😊",
  energized: "⚡",
};

function getGestureAnimation(gesture: AvatarAction) {
  if (gesture === "wave") {
    return {
      animate: { rotate: [0, -5, 6, -5, 4, 0], y: [0, -3, 0], scale: [1, 1.01, 1] },
      transition: { duration: 0.9, ease: "easeInOut" as const },
    };
  }

  if (gesture === "clap") {
    return {
      animate: { scale: [1, 1.03, 1], y: [0, -2, 0] },
      transition: { duration: 0.62, ease: "easeInOut" as const },
    };
  }

  if (gesture === "raise-hand") {
    return {
      animate: { y: [0, -6, -2, 0], scale: [1, 1.02, 1] },
      transition: { duration: 0.8, ease: "easeInOut" as const },
    };
  }

  return {
    animate: { rotate: 0, y: 0, scale: 1 },
    transition: { duration: 0.2, ease: "easeOut" as const },
  };
}

export function SocialHub() {
  const {
    profile,
    lobbyProgress,
    socialPresence,
    canAccessRoute,
    getPreviousStepRoute,
    pushToast,
    setLastVisitedRoute,
    setAvatarExpression,
    setAvatarLastAction,
  } = useAppState();
  const hasRedirectedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const navigate = useNavigate();
  const openRoute = useCallback(
    (path: string, replace = false) => {
      navigateWithTransition(navigate, path, replace ? { replace: true } : undefined);
    },
    [navigate]
  );

  const completedInteractions = lobbyProgress.visitedPoints.length;
  const activeUsers = Math.min(6, 2 + completedInteractions);
  const profileReady = Boolean(profile?.employeeName && profile?.roleTitle);
  const userDisplayName = (profile?.employeeName || "USER_01").toUpperCase();
  const userRole = (profile?.roleTitle || "UNASSIGNED").toUpperCase();
  const teammateLabel = completedInteractions >= 2 ? "TEAM_LEAD" : "MENTOR_BOT";
  const [proximityPercent, setProximityPercent] = useState(() => Math.min(100, 35 + completedInteractions * 20));
  const [activeGesture, setActiveGesture] = useState<AvatarAction>("idle");
  const [peerGesture, setPeerGesture] = useState<AvatarAction>("idle");
  const [emojiBursts, setEmojiBursts] = useState<EmojiBurst[]>([]);
  const actionTimeoutRef = useRef<number | null>(null);
  const peerTimeoutRef = useRef<number | null>(null);
  const emojiTimeoutMapRef = useRef(new Map<string, number>());

  const firstMissingPoint = lobbyPointOrder.find((pointId) => !lobbyProgress.visitedPoints.includes(pointId)) ?? null;
  const guidanceLine = firstMissingPoint
    ? socialTipsByPoint[firstMissingPoint]
    : "All lobby prerequisites complete. Social channels are fully unlocked.";

  useEffect(() => {
    setIsHydrated(true);
    if (!canAccessRoute("social") && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      pushToast({
        tone: "warning",
        title: "Social Hub is locked",
        description: "Complete key Lobby tasks to unlock social features.",
      });
      openRoute(routePathMap.lobby, true);
      return;
    }

    setLastVisitedRoute("social");
  }, [canAccessRoute, openRoute, pushToast, setLastVisitedRoute]);

  const stepCloser = useCallback(() => {
    setProximityPercent((current) => Math.min(100, current + 8));
  }, []);

  const stepAway = useCallback(() => {
    setProximityPercent((current) => Math.max(0, current - 8));
  }, []);

  const spawnEmojiBurst = useCallback((emoji: string, source: "user" | "peer") => {
    const burstId = `emoji_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const driftX = Math.floor(Math.random() * 34) - 17;

    setEmojiBursts((current) => [...current, { id: burstId, emoji, source, driftX }]);

    const timeoutId = window.setTimeout(() => {
      setEmojiBursts((current) => current.filter((burst) => burst.id !== burstId));
      emojiTimeoutMapRef.current.delete(burstId);
    }, 1200);
    emojiTimeoutMapRef.current.set(burstId, timeoutId);
  }, []);

  const triggerGesture = useCallback(
    (gesture: AvatarAction) => {
      if (actionTimeoutRef.current) {
        window.clearTimeout(actionTimeoutRef.current);
      }
      if (peerTimeoutRef.current) {
        window.clearTimeout(peerTimeoutRef.current);
      }

      if (gesture === "idle") {
        setActiveGesture("idle");
        setPeerGesture("idle");
        setAvatarLastAction("idle");
        return;
      }

      const actionDefinition = avatarActionOptions.find((option) => option.id === gesture);
      const actionLabel = actionDefinition?.label ?? gesture;

      setActiveGesture(gesture);
      setAvatarLastAction(gesture);
      spawnEmojiBurst(actionEmojiMap[gesture], "user");
      pushToast({
        tone: "info",
        title: `Avatar action: ${actionLabel}`,
        description: actionDefinition?.description ?? "Action sent to nearby peers.",
      });

      actionTimeoutRef.current = window.setTimeout(() => {
        setActiveGesture("idle");
      }, 1300);

      // Nearby teammate response: only reacts when in social range.
      if (proximityPercent >= 45) {
        const mirroredGesture: AvatarAction = gesture === "raise-hand" ? "wave" : gesture;
        peerTimeoutRef.current = window.setTimeout(() => {
          setPeerGesture(mirroredGesture);
          spawnEmojiBurst(actionEmojiMap[mirroredGesture], "peer");
          peerTimeoutRef.current = window.setTimeout(() => {
            setPeerGesture("idle");
          }, 1100);
        }, 340);
      }
    },
    [proximityPercent, pushToast, setAvatarLastAction, spawnEmojiBurst]
  );

  const changeExpression = useCallback(
    (expression: AvatarExpression) => {
      setAvatarExpression(expression);
      spawnEmojiBurst(expressionEmojiMap[expression], "user");
      const expressionDef = avatarExpressionOptions.find((option) => option.id === expression);
      pushToast({
        tone: "success",
        title: `Expression set: ${expressionDef?.label ?? expression}`,
        description: expressionDef?.description ?? "Expression updated.",
      });
    },
    [pushToast, setAvatarExpression, spawnEmojiBurst]
  );

  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        window.clearTimeout(actionTimeoutRef.current);
      }
      if (peerTimeoutRef.current) {
        window.clearTimeout(peerTimeoutRef.current);
      }
      emojiTimeoutMapRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      emojiTimeoutMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        openRoute(routePathMap[getPreviousStepRoute("social")]);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepCloser();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepAway();
        return;
      }

      if (event.key === "1") {
        event.preventDefault();
        triggerGesture("wave");
        return;
      }

      if (event.key === "2") {
        event.preventDefault();
        triggerGesture("clap");
        return;
      }

      if (event.key === "3") {
        event.preventDefault();
        triggerGesture("raise-hand");
        return;
      }

      const normalizedKey = event.key.toLowerCase();
      if (normalizedKey === "q") {
        event.preventDefault();
        changeExpression("focused");
        return;
      }

      if (normalizedKey === "w") {
        event.preventDefault();
        changeExpression("friendly");
        return;
      }

      if (normalizedKey === "e") {
        event.preventDefault();
        changeExpression("energized");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeExpression, getPreviousStepRoute, openRoute, stepAway, stepCloser, triggerGesture]);

  const connectionState = useMemo<ConnectionState>(() => {
    if (!profileReady) {
      return {
        title: "Profile Not Ready",
        hint: "Complete onboarding profile to enable personalized social channels.",
        level: "locked",
        audioStatus: "LIMITED",
        communicationStatus: "PREVIEW",
      };
    }

    if (completedInteractions === 0) {
      return {
        title: "Connection Initializing",
        hint: "Visit lobby interaction nodes to increase channel quality and team availability.",
        level: "locked",
        audioStatus: "WARMUP",
        communicationStatus: "STANDBY",
      };
    }

    if (completedInteractions < lobbyPointOrder.length) {
      return {
        title: "Channel Sync In Progress",
        hint: "Partial lobby sync detected. Continue onboarding tasks for stronger team presence.",
        level: "warming",
        audioStatus: "ADAPTIVE",
        communicationStatus: "ACTIVE",
      };
    }

    return {
      title: "Voice Connection Active",
      hint: "Lobby sync complete. Team rooms, social feed, and voice channels are fully available.",
      level: "ready",
      audioStatus: "ENABLED",
      communicationStatus: "ACTIVE",
    };
  }, [completedInteractions, profileReady]);

  const proximityState =
    proximityPercent >= 72 ? "Close" : proximityPercent >= 45 ? "In Range" : "Far";
  const quality =
    connectionState.level === "locked"
      ? "Initializing"
      : proximityPercent >= 72
        ? "High"
        : proximityPercent >= 45
          ? "Medium"
          : "Low";
  const distance =
    connectionState.level === "locked"
      ? "--"
      : `${Math.max(1.1, 4.6 - proximityPercent * 0.03).toFixed(1)}m`;
  const statusDotClass =
    connectionState.level === "ready"
      ? proximityPercent >= 72
        ? "bg-green-400"
        : "bg-lime-400"
      : connectionState.level === "warming"
        ? "bg-yellow-400"
        : "bg-zinc-500";
  const teammateHighlightClass =
    proximityPercent >= 72
      ? "border-white bg-white/15"
      : proximityPercent >= 45
        ? "border-white/80 bg-white/5"
        : "border-white/40 bg-black";
  const selectedExpression = socialPresence.selectedExpression;
  const lastActionId = socialPresence.lastAction;
  const lastActionLabel =
    lastActionId === "idle"
      ? "IDLE"
      : (avatarActionOptions.find((option) => option.id === lastActionId)?.label ?? lastActionId).toUpperCase();
  const expressionToneClass =
    selectedExpression === "friendly"
      ? "border-emerald-300/65 bg-emerald-200/10"
      : selectedExpression === "energized"
        ? "border-amber-200/70 bg-amber-200/10"
        : "border-white/70 bg-black";
  const expressionStatusLabel =
    selectedExpression === "friendly"
      ? "FRIENDLY"
      : selectedExpression === "energized"
        ? "ENERGIZED"
        : "FOCUSED";
  const userGestureMotion = getGestureAnimation(activeGesture);
  const peerGestureMotion = getGestureAnimation(peerGesture);

  if (!isHydrated) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="loading"
          compact
          title="Connecting Social Hub"
          description="Syncing teammate channels and spatial presence data."
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="empty"
          title="Profile missing"
          description="Complete onboarding to enable personalized social interactions."
          action={
            <button
              type="button"
              className="wf-btn wf-btn-primary px-4 py-2 text-xs font-mono"
              onClick={() => openRoute(routePathMap.onboarding)}
            >
              OPEN ONBOARDING
            </button>
          }
        />
      </div>
    );
  }

  return (
    <motion.div className="wf-page flex flex-col overflow-hidden" {...MOTION.page}>
      {/* Header */}
      <div className="wf-status-bar z-10 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => openRoute(routePathMap[getPreviousStepRoute("social")])}
              aria-label="Go back to the previous step"
              className="wf-btn flex items-center gap-2 px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 text-white/80" />
              <span className="text-white/80 font-mono text-sm">BACK</span>
            </button>
            <Users className="w-5 h-5 text-white/80" />
            <span className="wf-title text-sm">SOCIAL HUB</span>
          </div>
          <div className="text-white/60 font-mono text-xs">
            ACTIVE USERS: {activeUsers}
          </div>
        </div>
      </div>

      {/* Main scene */}
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-3 py-6 sm:px-4 sm:py-8">
        {/* Social context panel */}
        <motion.div
          className="wf-panel absolute left-2 top-4 w-[min(92vw,320px)] px-4 py-3 sm:left-6 sm:top-8 sm:w-80 sm:px-5 sm:py-4 md:left-8"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...MOTION.panel.transition, delay: 0.08 }}
        >
          <div className="flex items-center gap-2 text-white/80 font-mono text-xs mb-3 pb-2 border-b border-white/30">
            <Radio className="w-4 h-4" />
            SOCIAL CONTEXT
          </div>
          <div className="text-white/70 font-mono text-xs mb-2">USER: {userDisplayName}</div>
          <div className="text-white/70 font-mono text-xs mb-2">ROLE: {userRole}</div>
          <div className="text-white/65 font-mono text-[10px] mb-2">
            EXPRESSION: {expressionStatusLabel}
          </div>
          <div className="text-white/65 font-mono text-[10px] mb-2">
            LAST ACTION: {lastActionLabel}
          </div>
          <div className="text-white/60 font-mono text-[10px] mb-3">
            LAST LOBBY LOCATION: {(lobbyProgress.lastLocation || "Main Entrance").toUpperCase()}
          </div>
          <div className="text-white/60 text-xs leading-relaxed">
            {guidanceLine}
          </div>
          {firstMissingPoint && (
            <div className="mt-3 text-[10px] font-mono text-white/50">
              NEXT RECOMMENDED: {lobbyPointLabels[firstMissingPoint].toUpperCase()}
            </div>
          )}
        </motion.div>

        {/* Floor grid */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMax meet">
            {[...Array(8)].map((_, i) => (
              <g key={i}>
                <line
                  x1={i * 100}
                  y1="0"
                  x2={i * 100}
                  y2="300"
                  stroke="white"
                  strokeOpacity="0.15"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1={i * 40}
                  x2="800"
                  y2={i * 40}
                  stroke="white"
                  strokeOpacity="0.15"
                  strokeWidth="1"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Avatar Silhouettes */}
        <div className="relative h-[360px] w-[360px] sm:h-[420px] sm:w-[420px]">
          {/* Spatial Audio Zone - Dashed Circle */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <svg width="400" height="400" viewBox="0 0 400 400">
              <circle
                cx="200"
                cy="200"
                r={180}
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeOpacity={Math.max(0.28, proximityPercent / 100)}
                strokeDasharray="10,10"
              />
              {/* Audio wave rings */}
              <circle
                cx="200"
                cy="200"
                r={140}
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeOpacity={Math.max(0.16, proximityPercent / 200)}
              >
                <animate attributeName="r" values="140;160;140" dur="2s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle
                cx="200"
                cy="200"
                r={120}
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeOpacity={Math.max(0.16, proximityPercent / 220)}
              >
                <animate attributeName="r" values="120;140;120" dur="2s" begin="0.5s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </motion.div>

          {/* Avatar 1 - Left */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ marginLeft: "-80px" }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="relative"
              animate={userGestureMotion.animate}
              transition={userGestureMotion.transition}
            >
              {/* Head */}
              <div className={`w-16 h-16 border-2 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors ${expressionToneClass}`}>
                <div className="w-8 h-8 border border-white/50 rounded-full" />
              </div>
              {/* Body */}
              <div className={`w-20 h-32 border-2 transition-colors ${expressionToneClass}`} />
              {/* Legs */}
              <div className="flex gap-2 mt-1">
                <div className={`w-9 h-20 border-2 transition-colors ${expressionToneClass}`} />
                <div className={`w-9 h-20 border-2 transition-colors ${expressionToneClass}`} />
              </div>
              {/* Label */}
              <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <div className="text-white/70 font-mono text-xs">{userDisplayName}</div>
                <div className="text-white/45 font-mono text-[10px]">{userRole}</div>
                <div className="text-white/35 font-mono text-[10px] mt-0.5">{expressionStatusLabel}</div>
              </div>
              {/* Mic icon */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <Mic className="w-4 h-4 text-white/80" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Avatar 2 - Right */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ marginLeft: "80px" }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="relative"
              animate={peerGestureMotion.animate}
              transition={peerGestureMotion.transition}
            >
              {/* Head */}
              <div className={`w-16 h-16 border-2 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors ${teammateHighlightClass}`}>
                <div className="w-8 h-8 border border-white/50 rounded-full" />
              </div>
              {/* Body */}
              <div className={`w-20 h-32 border-2 transition-colors ${teammateHighlightClass}`} />
              {/* Legs */}
              <div className="flex gap-2 mt-1">
                <div className={`w-9 h-20 border-2 transition-colors ${teammateHighlightClass}`} />
                <div className={`w-9 h-20 border-2 transition-colors ${teammateHighlightClass}`} />
              </div>
              {/* Label */}
              <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <div className="text-white/70 font-mono text-xs">{teammateLabel}</div>
                <div className="text-white/45 font-mono text-[10px]">
                  {connectionState.level === "ready" ? "LIVE PEER" : "ASSISTED CHANNEL"}
                </div>
                <div className="text-white/35 font-mono text-[10px] mt-0.5">
                  {peerGesture === "idle" ? "LISTENING" : peerGesture.toUpperCase()}
                </div>
              </div>
              {/* Speaker icon */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}
                >
                  <Volume2 className="w-4 h-4 text-white/80" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Emoji burst layer */}
          {emojiBursts.map((burst) => (
            <motion.div
              key={burst.id}
              className="pointer-events-none absolute left-1/2 top-1/2 text-xl sm:text-2xl"
              style={{
                marginLeft: burst.source === "user" ? -112 + burst.driftX : 96 + burst.driftX,
                marginTop: -36,
              }}
              initial={{ opacity: 0, y: 10, scale: 0.82 }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, -16, -46, -76], scale: [0.82, 1.08, 1, 0.94] }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              aria-hidden="true"
            >
              {burst.emoji}
            </motion.div>
          ))}

          {/* Spatial Audio Zone Label */}
          <motion.div
            className="absolute -bottom-32 left-1/2 -translate-x-1/2 text-white/60 font-mono text-xs text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            SPATIAL AUDIO ZONE
          </motion.div>
        </div>

        {/* Avatar actions and expressions */}
        <motion.div
          className="wf-panel absolute bottom-[6.7rem] left-1/2 w-[min(94vw,520px)] -translate-x-1/2 px-3 py-3 sm:bottom-[7.8rem] sm:px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...MOTION.panel.transition, delay: 0.11 }}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
            <span>AVATAR ACTIONS</span>
            <span>CURRENT: {lastActionLabel}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {avatarActionOptions.map((actionOption) => {
              const ActionIcon = actionOption.icon;
              const isActive = activeGesture === actionOption.id;
              return (
                <button
                  key={actionOption.id}
                  type="button"
                  onClick={() => triggerGesture(actionOption.id)}
                  className={`wf-btn px-2 py-2 text-left ${isActive ? "wf-btn-primary" : "wf-btn-muted"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                      <ActionIcon className="h-3.5 w-3.5" />
                      {actionOption.label.toUpperCase()}
                    </span>
                    <span className="wf-kbd">{actionOption.hotkey}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-white/20 pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/65">
              <span>EXPRESSION MODE</span>
              <span>{expressionStatusLabel}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {avatarExpressionOptions.map((expressionOption) => {
                const ExpressionIcon = expressionOption.icon;
                const isSelected = selectedExpression === expressionOption.id;
                return (
                  <button
                    key={expressionOption.id}
                    type="button"
                    onClick={() => changeExpression(expressionOption.id)}
                    className={`wf-btn px-2 py-2 text-left ${isSelected ? "wf-btn-primary" : "wf-btn-muted"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                        <ExpressionIcon className="h-3.5 w-3.5" />
                        {expressionOption.label.toUpperCase()}
                      </span>
                      <span className="wf-kbd">{expressionOption.hotkey}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Proximity controls */}
        <motion.div
          className="wf-panel absolute bottom-3 left-1/2 w-[min(94vw,420px)] -translate-x-1/2 px-3 py-3 sm:bottom-8 sm:px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...MOTION.panel.transition, delay: 0.12 }}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
            <span>PROXIMITY SIMULATION</span>
            <span>STATE: {proximityState.toUpperCase()}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={stepAway}
              className="border border-white/50 px-3 py-1 text-[10px] font-mono text-white/75 hover:bg-white/10 transition-colors"
            >
              STEP AWAY
            </button>
            <div className="h-2 flex-1 border border-white/40 bg-black">
              <motion.div
                className="h-full bg-white"
                animate={{ width: `${proximityPercent}%`, opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <button
              type="button"
              onClick={stepCloser}
              className="border border-white/50 px-3 py-1 text-[10px] font-mono text-white/75 hover:bg-white/10 transition-colors"
            >
              STEP CLOSER
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-white/55">
            <span>DISTANCE: {distance}</span>
            <span>HOTKEY: LEFT/RIGHT · 1/2/3 · Q/W/E</span>
          </div>
        </motion.div>

        {/* Voice Connection Active Popup */}
        <motion.div
          className="wf-panel absolute right-2 top-[8.2rem] max-w-[220px] px-4 py-3 shadow-lg sm:right-6 sm:top-8 sm:max-w-[320px] sm:px-6 sm:py-4 md:right-8"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...MOTION.panel.transition, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className={`w-3 h-3 rounded-full ${statusDotClass}`}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span className="text-white font-mono text-sm">{connectionState.title}</span>
          </div>
          <div className="text-white/60 font-mono text-xs">
            Distance: {distance} | Quality: {quality}
          </div>
          <div className="text-white/55 font-mono text-[10px] mt-1">
            Expression: {expressionStatusLabel} | Gesture: {lastActionLabel}
          </div>
          <div className="text-white/50 text-[11px] leading-relaxed mt-2 max-w-[280px]">
            {connectionState.hint}
          </div>
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <div className="wf-status-bar px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-white/50 font-mono text-xs">
          <div>WIREFRAME: SOCIAL HUB</div>
          <div>SPATIAL AUDIO: {connectionState.audioStatus}</div>
          <div>AVATAR: {expressionStatusLabel} / {lastActionLabel}</div>
          <div>COMMUNICATION: {connectionState.communicationStatus}</div>
        </div>
      </div>
    </motion.div>
  );
}
