import { motion } from "motion/react";
import { CheckSquare, Square, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { StateMessage } from "../app/StateMessage";
import { routePathMap } from "../../lib/flow";
import {
  isLobbyCoreComplete,
  lobbyInteractionPoints,
  type LobbyInteractionPoint,
} from "../../lib/lobbyContent";
import { MOTION } from "../../lib/motion";
import { navigateWithTransition } from "../../lib/navigation";
import { type LobbyPointId } from "../../lib/lobbyProgress";
import { useAppState } from "../../state/AppStateContext";

export function VirtualOfficeLobby() {
  const {
    profile,
    lobbyProgress,
    canAccessRoute,
    getPreviousStepRoute,
    onboardingCompleted,
    lobbyCoreCompleted,
    setLastVisitedRoute,
    visitLobbyPoint,
    pushToast,
  } = useAppState();
  const [activePointId, setActivePointId] = useState<LobbyPointId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasRedirectedRef = useRef(false);
  const navigate = useNavigate();
  const openRoute = useCallback(
    (path: string, replace = false) => {
      navigateWithTransition(navigate, path, replace ? { replace: true } : undefined);
    },
    [navigate]
  );

  useEffect(() => {
    setIsHydrated(true);
    if (!canAccessRoute("lobby") && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      pushToast({
        tone: "warning",
        title: "Lobby is locked",
        description: "Finish onboarding first to unlock the lobby.",
      });
      openRoute(routePathMap.onboarding, true);
      return;
    }

    setLastVisitedRoute("lobby");
  }, [canAccessRoute, openRoute, pushToast, setLastVisitedRoute]);

  const taskList = useMemo(
    () => [
      { id: "onboarding", label: "Complete Onboarding", completed: onboardingCompleted },
      { id: "training-room", label: "Visit Training Room", completed: lobbyProgress.visitedPoints.includes("training-room") },
      { id: "team-desk", label: "Meet Team Members", completed: lobbyProgress.visitedPoints.includes("team-desk") },
      { id: "info-kiosk", label: "Check Info Kiosk", completed: lobbyProgress.visitedPoints.includes("info-kiosk") },
      { id: "unlock-social", label: "Unlock Social + History", completed: lobbyCoreCompleted },
    ],
    [lobbyCoreCompleted, lobbyProgress.visitedPoints, onboardingCompleted]
  );

  const completedCount = taskList.filter((task) => task.completed).length;
  const nextTask = taskList.find((task) => !task.completed)?.label ?? "All tasks complete";
  const progressPercent = Math.round((completedCount / taskList.length) * 100);
  const activePoint = lobbyInteractionPoints.find((point) => point.id === activePointId) ?? null;
  const currentLocation = activePoint?.locationLabel ?? lobbyProgress.lastLocation ?? "Main Entrance";

  const handlePointInteraction = (point: LobbyInteractionPoint) => {
    const alreadyVisited = lobbyProgress.visitedPoints.includes(point.id);
    const willCompleteCoreAfterVisit = isLobbyCoreComplete(
      alreadyVisited ? lobbyProgress.visitedPoints : [...lobbyProgress.visitedPoints, point.id]
    );

    setActivePointId(point.id);
    visitLobbyPoint(point.id, point.locationLabel);

    if (!alreadyVisited) {
      pushToast({
        tone: "success",
        title: `Task completed: ${point.label}`,
        description: "Lobby progress updated.",
      });
    }

    if (!lobbyCoreCompleted && willCompleteCoreAfterVisit) {
      pushToast({
        tone: "success",
        title: "Social and History unlocked",
        description: "Key Lobby tasks complete. New pages are now available.",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        openRoute(routePathMap[getPreviousStepRoute("lobby")]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getPreviousStepRoute, openRoute]);

  if (!isHydrated) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="loading"
          compact
          title="Loading lobby scene"
          description="Restoring tasks, map markers, and your previous location."
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
          description="Complete onboarding before entering the lobby."
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
    <motion.div className="wf-page relative overflow-hidden" {...MOTION.page}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => openRoute(routePathMap[getPreviousStepRoute("lobby")])}
        aria-label="Go back to the previous step"
        className="wf-btn absolute left-4 top-4 z-20 flex items-center gap-2 px-3 py-2 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
        <span className="text-white/80 font-mono text-sm">BACK</span>
      </button>

      {/* Task Checklist - Top Left */}
      <motion.div
        className="wf-panel absolute left-2 top-16 z-10 w-[min(92vw,292px)] p-4 sm:left-6 sm:top-20 sm:w-72"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={MOTION.panel.transition}
      >
        <div className="text-white/80 font-mono text-xs mb-4 pb-2 border-b border-white/30">
          TASK CHECKLIST
        </div>
        <div className="space-y-3">
          {taskList.map((task) => (
            <div key={task.id} className="flex items-start gap-2">
              {task.completed ? (
                <CheckSquare className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`font-mono text-xs ${
                  task.completed ? "text-white/60 line-through" : "text-white/80"
                }`}
              >
                {task.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/20 text-white/60 font-mono text-[10px]">
          PROGRESS: {completedCount}/{taskList.length} ({progressPercent}%)
        </div>
      </motion.div>

      {/* Context panel - Top Right */}
      <motion.div
        className="wf-panel absolute left-2 top-[17rem] z-10 w-[min(92vw,320px)] p-4 sm:left-auto sm:right-6 sm:top-20 sm:w-80"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...MOTION.panel.transition, delay: 0.08 }}
      >
        <div className="text-white/80 font-mono text-xs mb-3 pb-2 border-b border-white/30">
          LOBBY FEED
        </div>
        <div className="text-white/70 font-mono text-xs mb-3">
          USER: {(profile?.employeeName || "Guest").toUpperCase()}
        </div>
        <div className="text-white/70 font-mono text-xs mb-3">
          ROLE: {(profile?.roleTitle || "UNASSIGNED").toUpperCase()}
        </div>
        <div className="text-white/60 text-xs leading-relaxed mb-3">
          {activePoint
            ? activePoint.description
            : "Select an interaction node in the scene to unlock tasks and gather context."}
        </div>
        <div className="text-white/60 font-mono text-[10px]">
          CURRENT LOCATION: {currentLocation.toUpperCase()}
        </div>
        <div className="mt-2 text-white/60 font-mono text-[10px]">
          SOCIAL/HISTORY: {lobbyCoreCompleted ? "UNLOCKED" : "LOCKED"}
        </div>
      </motion.div>

      {/* Mini-map - Bottom Right */}
      <motion.div
        className="wf-panel absolute bottom-6 right-6 z-10 hidden h-40 w-40 p-0 sm:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...MOTION.panel.transition, delay: 0.14 }}
      >
        <div className="absolute -top-5 left-0 text-white/60 text-[10px] font-mono">
          MINI-MAP
        </div>
        <div className="absolute inset-0 p-3">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Grid */}
            {[...Array(4)].map((_, i) => (
              <g key={i}>
                <line
                  x1={(i + 1) * 20}
                  y1="0"
                  x2={(i + 1) * 20}
                  y2="100"
                  stroke="white"
                  strokeOpacity="0.2"
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1={(i + 1) * 20}
                  x2="100"
                  y2={(i + 1) * 20}
                  stroke="white"
                  strokeOpacity="0.2"
                  strokeWidth="0.5"
                />
              </g>
            ))}
            {/* Player position */}
            <motion.circle
              cx="50"
              cy="70"
              r={3}
              fill="white"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Interaction markers */}
            {lobbyInteractionPoints.map((point) => (
              <rect
                key={point.id}
                x={point.mapX}
                y={point.mapY}
                width="3"
                height="3"
                fill="white"
                fillOpacity={lobbyProgress.visitedPoints.includes(point.id) ? "0.95" : "0.45"}
              />
            ))}
          </svg>
        </div>
      </motion.div>

      {/* First-Person 3D Perspective View */}
      <div className="min-h-screen w-full flex items-center justify-center" style={{ perspective: "1200px" }}>
        <div className="relative w-full h-full max-w-7xl">
          {/* Floor grid perspective */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2">
            <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax meet">
              {/* Perspective grid lines */}
              {[...Array(10)].map((_, i) => {
                const y = 400 - (i * 35);
                const offset = (9 - i) * 40;
                return (
                  <line
                    key={`h-${i}`}
                    x1={offset}
                    y1={y}
                    x2={1000 - offset}
                    y2={y}
                    stroke="white"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />
                );
              })}
              {[...Array(7)].map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={150 + i * 115}
                  y1="400"
                  x2={450 + i * 20}
                  y2="50"
                  stroke="white"
                  strokeOpacity="0.2"
                  strokeWidth="1"
                />
              ))}
            </svg>
          </div>

          {/* Welcome Sign - Center */}
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="border-4 border-white/80 bg-black px-12 py-8 text-center">
              <div className="text-white font-mono text-3xl mb-2">WELCOME TO</div>
              <div className="text-white font-mono text-4xl">PolyU Tech</div>
              <div className="mt-4 h-[2px] bg-white/40 w-full" />
            </div>
          </motion.div>

          {/* Office Furniture - Left Side */}
          <motion.div
            className="absolute left-12 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Desk */}
            <div className="border-2 border-white/50 w-48 h-32 bg-black/50 mb-4" />
            {/* Chair */}
            <div className="border-2 border-white/50 w-24 h-20 bg-black/50 ml-12" />
          </motion.div>

          {/* Office Furniture - Right Side */}
          <motion.div
            className="absolute right-12 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Plant */}
            <div className="border-2 border-white/50 w-16 h-32 bg-black/50 mb-4 mx-auto" />
            {/* Table */}
            <div className="border-2 border-white/50 w-40 h-24 bg-black/50" />
          </motion.div>

          {/* Furniture - Far Center (smaller due to perspective) */}
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="border-2 border-white/40 w-32 h-16 bg-black/30" />
          </motion.div>

          {/* Interaction nodes */}
          {lobbyInteractionPoints.map((point, index) => {
            const Icon = point.icon;
            const hasVisited = lobbyProgress.visitedPoints.includes(point.id);
            const isActive = activePointId === point.id;

            return (
              <motion.button
                key={point.id}
                type="button"
                onClick={() => handlePointInteraction(point)}
                aria-label={`Interact with ${point.label}`}
                className={`absolute ${point.positionClass} z-20 border-2 px-3 py-2 bg-black/90 backdrop-blur-sm flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  isActive || hasVisited ? "border-white text-white" : "border-white/60 text-white/80"
                }`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.08 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-mono text-xs">{point.shortLabel}</span>
              </motion.button>
            );
          })}

          {/* Crosshair/Center indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative w-8 h-8">
              <div className="absolute top-1/2 left-0 w-2 h-[1px] bg-white/40" />
              <div className="absolute top-1/2 right-0 w-2 h-[1px] bg-white/40" />
              <div className="absolute left-1/2 top-0 h-2 w-[1px] bg-white/40" />
              <div className="absolute left-1/2 bottom-0 h-2 w-[1px] bg-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="wf-status-bar absolute bottom-0 left-0 right-0 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-white/50 font-mono text-xs">
          <div>WIREFRAME: VIRTUAL OFFICE LOBBY</div>
          <div>TASK PROGRESS: {completedCount}/{taskList.length}</div>
          <div>LOCATION: {currentLocation.toUpperCase()}</div>
        </div>
        <div className="mt-1 text-white/40 font-mono text-[10px]">NEXT: {nextTask.toUpperCase()}</div>
      </div>
    </motion.div>
  );
}
