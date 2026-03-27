import { motion, AnimatePresence } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { X, Calendar, Award, TrendingUp, Building, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { StateMessage } from "../app/StateMessage";
import { routePathMap } from "../../lib/flow";
import { MOTION } from "../../lib/motion";
import { navigateWithTransition } from "../../lib/navigation";
import { resolveAchievementBadges } from "../../lib/achievements";
import { useAppState } from "../../state/AppStateContext";

interface Milestone {
  year: string;
  title: string;
  summary: string;
  details: string;
  impact: string;
  imageLabel: string;
  icon: LucideIcon;
}

const milestones: Milestone[] = [
  {
    year: "2015",
    title: "Company Founded in Hong Kong",
    summary: "The founding team launched a small distributed studio focused on immersive enterprise tools.",
    details:
      "Initial operations started with 12 specialists across product, engineering, and client delivery. The first milestone was establishing an internal collaboration prototype for remote design reviews.",
    impact: "Set the strategic direction for enterprise-ready virtual collaboration.",
    imageLabel: "Founding Office Snapshot",
    icon: Building,
  },
  {
    year: "2017",
    title: "Expanded to 5 Regional Offices",
    summary: "Operations scaled across APAC with dedicated hubs for engineering and customer support.",
    details:
      "Regional teams standardized onboarding workflows and introduced shared handoff practices. This expansion cut customer onboarding lead time by nearly 35% across major enterprise projects.",
    impact: "Established resilient multi-region delivery and support capability.",
    imageLabel: "Regional Expansion Map",
    icon: TrendingUp,
  },
  {
    year: "2019",
    title: "Innovation Excellence Award",
    summary: "Recognized for pioneering collaboration tooling in mixed reality environments.",
    details:
      "The award-winning program integrated live annotation, avatar-presence signaling, and immersive sprint rooms into one connected suite. External recognition helped accelerate enterprise adoption.",
    impact: "Increased brand credibility and opened strategic partnership channels.",
    imageLabel: "Award Ceremony Moment",
    icon: Award,
  },
  {
    year: "2022",
    title: "Launched Metaverse Platform",
    summary: "Released a unified platform for onboarding, social collaboration, and knowledge spaces.",
    details:
      "The launch combined user identity setup, virtual office navigation, and historical knowledge boards into one product surface. Teams reported faster new-hire ramp-up and better cross-team discovery.",
    impact: "Delivered a scalable foundation for immersive workplace experiences.",
    imageLabel: "Platform Launch Dashboard",
    icon: Calendar,
  },
];

export function CompanyHistoryBoard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    profile,
    onboardingCompleted,
    lobbyCoreCompleted,
    lobbyProgress,
    socialPresence,
    canAccessRoute,
    getPreviousStepRoute,
    pushToast,
    setLastVisitedRoute,
  } = useAppState();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const achievementWallRef = useRef<HTMLDivElement | null>(null);
  const openRoute = useCallback(
    (path: string, replace = false) => {
      navigateWithTransition(navigate, path, replace ? { replace: true } : undefined);
    },
    [navigate]
  );
  const scrollToAchievementWall = useCallback(() => {
    achievementWallRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const currentMilestone = milestones[activeMilestoneIndex] ?? {
    year: "----",
    title: "Milestone Unavailable",
    summary: "No milestone data is currently available.",
    details: "Please check your data source and refresh.",
    impact: "N/A",
    imageLabel: "Unavailable",
    icon: Calendar,
  };
  const CurrentMilestoneIcon = currentMilestone.icon;
  const achievementBadges = useMemo(
    () =>
      resolveAchievementBadges({
        onboardingCompleted,
        visitedPoints: lobbyProgress.visitedPoints,
        lobbyCoreCompleted,
        lastAction: socialPresence.lastAction,
        selectedExpression: socialPresence.selectedExpression,
      }),
    [lobbyCoreCompleted, lobbyProgress.visitedPoints, onboardingCompleted, socialPresence.lastAction, socialPresence.selectedExpression]
  );
  const unlockedBadgeCount = achievementBadges.filter((badge) => badge.unlocked).length;
  const achievementProgressPercent = Math.round((unlockedBadgeCount / achievementBadges.length) * 100);

  const openMilestone = (index: number, trigger?: HTMLElement | null) => {
    lastTriggerRef.current = trigger ?? null;
    setActiveMilestoneIndex(index);
    setIsModalOpen(true);
  };

  const goToNextMilestone = () => {
    setActiveMilestoneIndex((previousIndex) => (previousIndex + 1) % milestones.length);
  };

  const goToPreviousMilestone = () => {
    setActiveMilestoneIndex((previousIndex) => (previousIndex - 1 + milestones.length) % milestones.length);
  };

  useEffect(() => {
    setIsHydrated(true);
    if (!canAccessRoute("history") && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      pushToast({
        tone: "warning",
        title: "History Board is locked",
        description: "Finish key Lobby tasks to unlock this archive.",
      });
      openRoute(routePathMap.lobby, true);
      return;
    }

    setLastVisitedRoute("history");
  }, [canAccessRoute, openRoute, pushToast, setLastVisitedRoute]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextMilestone();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousMilestone();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      (lastTriggerRef.current ?? previouslyFocusedElement)?.focus();
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        openRoute(routePathMap[getPreviousStepRoute("history")]);
        return;
      }

      if (event.key.toLowerCase() === "a") {
        event.preventDefault();
        scrollToAchievementWall();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getPreviousStepRoute, isModalOpen, openRoute, scrollToAchievementWall]);

  if (!isHydrated) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="loading"
          compact
          title="Loading company archive"
          description="Preparing timeline cards and milestone details."
        />
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="empty"
          title="No history milestones yet"
          description="Add milestone records to unlock the history board."
          action={
            <button
              type="button"
              className="wf-btn wf-btn-primary px-4 py-2 text-xs font-mono"
              onClick={() => openRoute(routePathMap[getPreviousStepRoute("history")])}
            >
              BACK TO LOBBY
            </button>
          }
        />
      </div>
    );
  }

  return (
    <motion.div
      className="wf-page relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-14"
      {...MOTION.page}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => openRoute(routePathMap[getPreviousStepRoute("history")])}
        aria-label="Go back to the previous step"
        className="wf-btn absolute left-4 top-4 z-30 flex items-center gap-2 px-3 py-2 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
        <span className="text-white/80 font-mono text-sm">BACK</span>
      </button>

      {/* 3D Perspective environment */}
      <div className="absolute inset-0" style={{ perspective: "1000px" }}>
        {/* Floor grid */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2">
          <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax meet">
            {[...Array(10)].map((_, i) => {
              const y = 400 - i * 35;
              const offset = (9 - i) * 40;
              return (
                <line
                  key={`h-${i}`}
                  x1={offset}
                  y1={y}
                  x2={1000 - offset}
                  y2={y}
                  stroke="white"
                  strokeOpacity="0.15"
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
                strokeOpacity="0.15"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Company History Board */}
      <motion.div
        className="relative z-10 w-full max-w-5xl"
        initial={MOTION.panel.initial}
        animate={MOTION.panel.animate}
        transition={MOTION.panel.transition}
      >
        <div className="wf-panel p-5 sm:p-7 md:p-9">
          <div className="text-center mb-8">
            <div className="wf-title mb-2 text-[var(--wf-fs-hero)]">COMPANY HISTORY</div>
            <div className="wf-meta">
              TIMELINE CURATED FOR {(profile?.employeeName || "GUEST").toUpperCase()}
            </div>
            <div className="h-1 bg-white/40 w-56 mx-auto mt-4" />
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <span className="wf-chip border-white/35 text-white/75">DIGITAL COLLECTIBLES ENTRANCE</span>
              <button
                type="button"
                onClick={scrollToAchievementWall}
                className="wf-btn wf-btn-primary px-3 py-1.5 font-mono text-[11px]"
              >
                VIEW ACHIEVEMENT WALL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.button
                  key={milestone.year}
                  type="button"
                  onClick={(event) => openMilestone(index, event.currentTarget)}
                  aria-label={`Open milestone ${milestone.year} ${milestone.title}`}
                  className="wf-panel-soft wf-focus p-4 text-left transition-colors hover:border-white/65"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="wf-meta">{milestone.year}</div>
                      <div className="wf-title mt-1 text-sm">{milestone.title}</div>
                    </div>
                    <Icon className="w-5 h-5 text-white/70 flex-shrink-0" />
                  </div>
                  <div className="mt-3 flex h-20 items-center justify-center border border-white/25 bg-black/50">
                    <span className="text-white/50 font-mono text-[10px]">
                      {milestone.imageLabel.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-white/66">{milestone.summary}</p>
                </motion.button>
              );
            })}
          </div>

          <div ref={achievementWallRef} className="wf-panel-soft mt-7 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/25 pb-3">
              <div>
                <div className="wf-meta">PERSONAL ACHIEVEMENT & COLLECTIBLES WALL</div>
                <div className="mt-1 text-xs text-white/60">
                  Unlock emoji badges by finishing key onboarding, lobby, and social actions.
                </div>
              </div>
              <div className="wf-chip border-white/35 text-white/70">
                UNLOCKED {unlockedBadgeCount}/{achievementBadges.length}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {achievementBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`wf-panel-soft p-3 ${
                    badge.unlocked
                      ? "border-white/45 bg-white/[0.08]"
                      : "border-white/20 bg-black/35"
                  }`}
                  aria-label={`${badge.title} ${badge.unlocked ? "unlocked" : "locked"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`text-2xl leading-none ${badge.unlocked ? "opacity-100" : "opacity-45"}`}>
                      {badge.emoji}
                    </div>
                    <div>
                      <div className="font-mono text-xs tracking-wide text-white/78">{badge.title}</div>
                      <div className="font-mono text-[10px] text-white/50">
                        {badge.unlocked ? "UNLOCKED" : "LOCKED 🔒"}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-white/60">
                    {badge.unlocked ? badge.description : badge.unlockHint}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-white/20 pt-3 text-xs font-mono text-white/52">
              ACHIEVEMENT SYNC: {achievementProgressPercent}%
            </div>
          </div>

          <div className="mt-6 text-center text-white/50 font-mono text-xs">
            SELECT ANY MILESTONE CARD TO VIEW FULL DETAILS
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              aria-hidden="true"
            />

            {/* Modal Window */}
            <motion.div
              id="company-history-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="milestone-title"
              aria-describedby="milestone-details"
              className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,860px)] -translate-x-1/2 -translate-y-1/2 px-1 sm:px-2"
              {...MOTION.modal}
            >
              <div className="wf-panel max-h-[88vh] overflow-y-auto p-5 sm:p-7 md:p-9">
                {/* Modal Header */}
                <div className="mb-6 flex items-center justify-between border-b border-white/30 pb-4 sm:mb-7">
                  <div>
                    <div className="wf-meta">MILESTONE ARCHIVE</div>
                    <h2 id="milestone-title" className="wf-title mt-1 text-lg sm:text-2xl">
                      {currentMilestone.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    ref={closeButtonRef}
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Close company milestones dialog"
                    className="wf-btn p-2"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Milestone content */}
                <div className="mb-7 space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3 font-mono text-xs text-white/80 sm:text-sm">
                    <CurrentMilestoneIcon className="w-5 h-5" />
                    <span>YEAR: {currentMilestone.year}</span>
                  </div>

                  <div className="flex h-32 items-center justify-center border border-white/35 bg-black/60 sm:h-40">
                    <span className="text-white/50 font-mono text-xs">
                      {currentMilestone.imageLabel.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-white/80">{currentMilestone.summary}</p>
                  <p id="milestone-details" className="text-sm leading-relaxed text-white/68">
                    {currentMilestone.details}
                  </p>

                  <div className="border-l-2 border-white/50 pl-4 text-white/70 text-sm">
                    <span className="font-mono text-xs text-white/50">IMPACT</span>
                    <div className="mt-1">{currentMilestone.impact}</div>
                  </div>
                </div>

                {/* Prev/Next controls */}
                <div className="mb-6 grid grid-cols-1 items-center gap-3 sm:flex sm:justify-between sm:gap-4">
                  <motion.button
                    type="button"
                    onClick={goToPreviousMilestone}
                    className="wf-btn inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    PREVIOUS
                  </motion.button>

                  <div className="text-white/60 font-mono text-xs">
                    ENTRY {activeMilestoneIndex + 1} / {milestones.length}
                  </div>

                  <motion.button
                    type="button"
                    onClick={goToNextMilestone}
                    className="wf-btn inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    NEXT
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Exit Button */}
                <motion.button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="wf-btn wf-btn-primary h-12 w-full font-mono text-sm sm:h-14 sm:text-lg"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.995 }}
                >
                  BACK TO BOARD
                </motion.button>

                {/* Modal footer */}
                <div className="mt-5 border-t border-white/20 pt-4 text-center font-mono text-[11px] text-white/52">
                  NAVIGATION: USE LEFT/RIGHT ARROW KEYS OR BUTTONS
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom status bar */}
      <div className="wf-status-bar absolute bottom-0 left-0 right-0 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/50">
          <div>WIREFRAME: COMPANY HISTORY BOARD</div>
          <div>INTERACTION: CARD-BASED TIMELINE</div>
          <div>SHORTCUT: A = ACHIEVEMENT WALL</div>
          <div>BADGES: {unlockedBadgeCount}/{achievementBadges.length}</div>
          <div>ENTRY: {activeMilestoneIndex + 1}/{milestones.length}</div>
        </div>
      </div>
    </motion.div>
  );
}
