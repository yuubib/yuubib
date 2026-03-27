import { motion } from "motion/react";
import { LogIn, Building2, Users, BookOpen, Lock, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { StateMessage } from "../app/StateMessage";
import { routePathMap, type AppRouteKey } from "../../lib/flow";
import { MOTION } from "../../lib/motion";
import { navigateWithTransition } from "../../lib/navigation";
import { useAppState } from "../../state/AppStateContext";

interface ScreenDefinition {
  routeKey: AppRouteKey;
  title: string;
  description: string;
  icon: typeof LogIn;
  unlockHint: string;
}

const screens: ScreenDefinition[] = [
  {
    routeKey: "onboarding",
    title: "Onboarding Login",
    description: "Avatar selection & employee entry",
    icon: LogIn,
    unlockHint: "Always available",
  },
  {
    routeKey: "lobby",
    title: "Virtual Office Lobby",
    description: "First-person 3D perspective view",
    icon: Building2,
    unlockHint: "Unlock by completing onboarding",
  },
  {
    routeKey: "social",
    title: "Social Hub",
    description: "Spatial audio & avatar interaction",
    icon: Users,
    unlockHint: "Unlock by completing key Lobby tasks",
  },
  {
    routeKey: "history",
    title: "History + Collectibles",
    description: "Timeline + Personal Achievement Wall",
    icon: BookOpen,
    unlockHint: "Unlock by completing key Lobby tasks (Training + Team Desk)",
  },
];

export function ScreenSelector() {
  const navigate = useNavigate();
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const { canAccessRoute, continueRoute, pushToast, unlockedRoutes } = useAppState();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const continueScreen = useMemo(
    () => screens.find((screen) => screen.routeKey === continueRoute) ?? screens[0],
    [continueRoute]
  );

  const openRoute = useCallback(
    (routeKey: AppRouteKey) => {
      navigateWithTransition(navigate, routePathMap[routeKey]);
    },
    [navigate]
  );

  const handleOpenScreen = useCallback(
    (screen: ScreenDefinition) => {
      if (!canAccessRoute(screen.routeKey)) {
        pushToast({
          tone: "warning",
          title: `${screen.title} is locked`,
          description: screen.unlockHint,
        });
        return;
      }

      openRoute(screen.routeKey);
    },
    [canAccessRoute, openRoute, pushToast]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        openRoute(continueRoute);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((previous) => {
          const next = (previous + 1) % screens.length;
          cardRefs.current[next]?.focus();
          return next;
        });
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((previous) => {
          const next = (previous - 1 + screens.length) % screens.length;
          cardRefs.current[next]?.focus();
          return next;
        });
        return;
      }

      if (event.key === "Enter" && document.activeElement === document.body) {
        event.preventDefault();
        handleOpenScreen(screens[activeIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, continueRoute, handleOpenScreen, openRoute]);

  if (!isHydrated) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="loading"
          compact
          title="Loading workspace state"
          description="Restoring your previous onboarding and task progress."
        />
      </div>
    );
  }

  if (screens.length === 0) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="empty"
          title="No screens configured"
          description="Please add at least one screen definition to continue."
        />
      </div>
    );
  }

  if (unlockedRoutes.length === 0) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="error"
          title="State initialization failed"
          description="No available route was detected. Refresh and try again."
          action={
            <button type="button" className="wf-btn wf-btn-primary px-4 py-2 text-xs" onClick={() => openRoute("onboarding")}>
              START ONBOARDING
            </button>
          }
        />
      </div>
    );
  }

  return (
    <motion.div className="wf-page flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8" {...MOTION.page}>
      <div className="wf-shell">
        <motion.div className="text-center" {...MOTION.panel}>
          <h1 className="wf-title text-[var(--wf-fs-hero)]">VR METAVERSE WIREFRAME KIT</h1>
          <div className="mx-auto mt-3 h-[2px] w-48 bg-white/25 sm:w-64" />
          <p className="mt-4 text-sm tracking-wide text-white/65">SELECT A SCREEN TO CONTINUE</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="wf-chip inline-flex items-center gap-2 border-white/40 text-white/75">
              <Play className="h-3.5 w-3.5" />
              CONTINUE: {continueScreen.title.toUpperCase()}
            </span>
            <span className="wf-chip">UNLOCKED: {unlockedRoutes.length}/5</span>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => openRoute(continueRoute)}
              className="wf-btn wf-btn-primary px-5 py-2.5 text-xs font-mono tracking-wide"
            >
              CONTINUE LAST PROGRESS
            </button>
          </div>
        </motion.div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-2 md:gap-5">
          {screens.map((screen, index) => {
            const Icon = screen.icon;
            const isUnlocked = canAccessRoute(screen.routeKey);

            return (
              <motion.button
                key={screen.routeKey}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                type="button"
                onClick={() => handleOpenScreen(screen)}
                onFocus={() => setActiveIndex(index)}
                aria-label={`Open ${screen.title}`}
                className={`wf-panel wf-focus p-5 text-left transition-colors sm:p-6 ${
                  isUnlocked ? "hover:border-[var(--wf-border-strong)]" : "opacity-90"
                }`}
                initial={MOTION.panel.initial}
                animate={MOTION.panel.animate}
                transition={{ ...MOTION.panel.transition, ...MOTION.listItemDelay(index) }}
                whileHover={isUnlocked ? { y: -2 } : { y: -1 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className={`wf-panel-soft p-2.5 ${isUnlocked ? "border-white/45" : "border-white/20"}`}>
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${isUnlocked ? "text-white/85" : "text-white/40"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`wf-title text-base ${isUnlocked ? "text-white" : "text-white/70"}`}>{screen.title}</h3>
                    <p className="mt-1 text-xs text-white/60">{screen.description}</p>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-amber-100/35 bg-amber-50/5 px-2 py-1 text-[11px] text-amber-100/85">
                    <Lock className="h-3.5 w-3.5" />
                    {screen.unlockHint}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-white/45">
                  <div className="h-[1px] flex-1 bg-white/20" />
                  <span>{isUnlocked ? "ENTER" : "LOCKED"}</span>
                  <div className="h-[1px] flex-1 bg-white/20" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-7 border-t border-white/15 pt-4 text-center text-[11px] text-white/52 sm:mt-8">
          KEYBOARD: <span className="wf-kbd">TAB</span> <span className="wf-kbd">ENTER</span>{" "}
          <span className="wf-kbd">ESC</span> <span className="hidden sm:inline">·</span>{" "}
          <span className="block sm:inline">ARROW KEYS TO MOVE BETWEEN CARDS</span>
        </div>
      </div>
    </motion.div>
  );
}
