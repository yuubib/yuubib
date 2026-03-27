import { motion } from "motion/react";
import { User, Briefcase, Glasses, Headphones, Hand, Smile, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { StateMessage } from "../app/StateMessage";
import { routePathMap } from "../../lib/flow";
import { MOTION } from "../../lib/motion";
import { navigateWithTransition } from "../../lib/navigation";
import { roleProfiles } from "../../lib/profile";
import { useAppState } from "../../state/AppStateContext";

const avatarIcons = [
  { icon: User, label: "Avatar 01" },
  { icon: Briefcase, label: "Avatar 02" },
  { icon: Glasses, label: "Avatar 03" },
  { icon: Headphones, label: "Avatar 04" },
  { icon: Hand, label: "Avatar 05" },
  { icon: Smile, label: "Avatar 06" },
];

const MIN_NAME_LENGTH = 2;

interface FormErrors {
  employeeName?: string;
  roleId?: string;
}

export function OnboardingLogin() {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedRoleId, setSelectedRoleId] = useState(roleProfiles[0]?.id ?? "");
  const [employeeName, setEmployeeName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const navigate = useNavigate();
  const { profile, completeOnboarding, getPreviousStepRoute, setLastVisitedRoute, pushToast } = useAppState();

  const openRoute = useCallback(
    (path: string) => {
      navigateWithTransition(navigate, path);
    },
    [navigate]
  );

  useEffect(() => {
    setLastVisitedRoute("onboarding");
    setIsHydrated(true);
  }, [setLastVisitedRoute]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setEmployeeName(profile.employeeName);
    setSelectedAvatar(Math.min(Math.max(profile.avatarIndex, 0), avatarIcons.length - 1));

    const roleExists = roleProfiles.some((role) => role.id === profile.roleId);
    if (roleExists) {
      setSelectedRoleId(profile.roleId);
    }
  }, [profile]);

  const selectedRole = useMemo(
    () => roleProfiles.find((role) => role.id === selectedRoleId) ?? null,
    [selectedRoleId]
  );

  const formIsValid = employeeName.trim().length >= MIN_NAME_LENGTH && Boolean(selectedRole);

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const trimmedName = employeeName.trim();

    if (!trimmedName) {
      nextErrors.employeeName = "Employee name is required.";
    } else if (trimmedName.length < MIN_NAME_LENGTH) {
      nextErrors.employeeName = `Please enter at least ${MIN_NAME_LENGTH} characters.`;
    }

    if (!selectedRoleId) {
      nextErrors.roleId = "Please select a role profile.";
    }

    return nextErrors;
  };

  const handleEnterOffice = useCallback(() => {
    setSubmitAttempted(true);

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedRole) {
      return;
    }

    completeOnboarding({
      employeeName: employeeName.trim(),
      roleId: selectedRole.id,
      roleTitle: selectedRole.title,
      department: selectedRole.department,
      skillTags: selectedRole.skillTags,
      avatarIndex: selectedAvatar,
      avatarLabel: avatarIcons[selectedAvatar].label,
    });

    pushToast({
      tone: "success",
      title: "Onboarding completed",
      description: "Lobby unlocked. You can continue your first-day tasks.",
    });

    openRoute(routePathMap.lobby);
  }, [completeOnboarding, employeeName, openRoute, pushToast, selectedAvatar, selectedRole]);

  useEffect(() => {
    const backRoute = getPreviousStepRoute("onboarding");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        openRoute(routePathMap[backRoute]);
        return;
      }

      if (event.key === "Enter") {
        const target = event.target as HTMLElement | null;
        if (target?.tagName === "BUTTON" || target?.tagName === "TEXTAREA") {
          return;
        }

        event.preventDefault();
        handleEnterOffice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getPreviousStepRoute, handleEnterOffice, openRoute]);

  if (!isHydrated) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="loading"
          compact
          title="Preparing onboarding"
          description="Loading your profile draft and role templates."
        />
      </div>
    );
  }

  if (roleProfiles.length === 0) {
    return (
      <div className="wf-page flex items-center justify-center px-4 py-10">
        <StateMessage
          tone="error"
          title="Role templates unavailable"
          description="No onboarding role profile is configured. Please add role templates first."
          action={
            <button
              type="button"
              className="wf-btn wf-btn-primary px-4 py-2 text-xs font-mono"
              onClick={() => openRoute(routePathMap[getPreviousStepRoute("onboarding")])}
            >
              GO BACK
            </button>
          }
        />
      </div>
    );
  }

  return (
    <motion.div className="wf-page relative flex items-center justify-center px-4 py-16 sm:px-6 sm:py-20" {...MOTION.page}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => openRoute(routePathMap[getPreviousStepRoute("onboarding")])}
        aria-label="Go back to the previous step"
        className="wf-btn absolute left-4 top-4 z-20 flex items-center gap-2 px-3 py-2 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
        <span className="text-white/80 font-mono text-sm">BACK</span>
      </button>

      <motion.div
        className="wf-panel w-full max-w-4xl p-5 sm:p-7 md:p-10"
        initial={MOTION.panel.initial}
        animate={MOTION.panel.animate}
        transition={MOTION.panel.transition}
      >
        {/* Header */}
        <div className="mb-7 text-center sm:mb-9">
          <h1 className="wf-title text-[var(--wf-fs-title)] sm:text-[1.5rem]">METAVERSE ONBOARDING</h1>
          <div className="mx-auto mt-3 h-[2px] w-40 bg-white/25 sm:w-48" />
        </div>

        {/* Choose Avatar Section */}
        <div className="mb-7">
          <div className="mb-5 text-center font-mono text-xs text-white/75 sm:text-sm">
            CHOOSE YOUR AVATAR
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {avatarIcons.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedAvatar === index;

              return (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAvatar(index)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${item.label}`}
                  className={`aspect-square rounded-full border-2 ${
                    isSelected ? "border-white bg-white/15" : "border-white/45 bg-black/70"
                  } flex items-center justify-center transition-all`}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-8 h-8 ${isSelected ? "text-white" : "text-white/70"}`} />
                </motion.button>
              );
            })}
          </div>

          {/* Selected avatar label */}
          <div className="mt-4 text-center font-mono text-[11px] text-white/55 sm:text-xs">
            SELECTED: {avatarIcons[selectedAvatar].label.toUpperCase()}
          </div>
        </div>

        {/* Role Profile Section */}
        <div className="mb-7">
          <div className="mb-4 text-center font-mono text-xs text-white/75 sm:text-sm">
            SELECT ROLE PROFILE
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleProfiles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              return (
                <motion.button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    if (errors.roleId) {
                      setErrors((previous) => ({ ...previous, roleId: undefined }));
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select role ${role.title}`}
                  className={`border-2 p-4 text-left transition-colors ${
                    isSelected
                      ? "border-white bg-white/10"
                      : "border-white/40 bg-black/70 hover:border-white/70"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="text-white font-mono text-base">{role.title}</div>
                  <div className="text-white/60 font-mono text-xs mt-1">{role.department}</div>
                  <p className="mt-3 text-xs leading-relaxed text-white/68">{role.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {role.skillTags.map((skillTag) => (
                      <span key={skillTag} className="wf-chip">
                        {skillTag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {errors.roleId && (
            <div className="mt-3 text-center font-mono text-xs text-[var(--wf-danger)]">{errors.roleId}</div>
          )}
        </div>

        {/* Profile Preview */}
        <div className="wf-panel-soft mb-7 p-4">
          <div className="mb-3 font-mono text-xs text-white/78">PROFILE PREVIEW</div>
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-start">
            <div className="wf-panel-soft p-4 flex flex-col items-center justify-center">
              <div className="mb-2 font-mono text-[10px] text-white/55">ACTIVE AVATAR</div>
              {(() => {
                const ActiveIcon = avatarIcons[selectedAvatar].icon;
                return <ActiveIcon className="w-10 h-10 text-white/80" />;
              })()}
              <div className="mt-2 font-mono text-[10px] text-white/55">
                {avatarIcons[selectedAvatar].label.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="text-white/80">
                NAME: <span className="text-white">{employeeName.trim() || "NOT SET"}</span>
              </div>
              <div className="text-white/80">
                ROLE: <span className="text-white">{selectedRole?.title ?? "NOT SET"}</span>
              </div>
              <div className="text-white/80">
                DEPARTMENT: <span className="text-white">{selectedRole?.department ?? "NOT SET"}</span>
              </div>
              <div className="text-white/80">
                SKILLS:
                <span className="text-white">
                  {" "}
                  {selectedRole ? selectedRole.skillTags.join(", ") : "NOT SET"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Name Input */}
        <div className="mb-7">
          <label htmlFor="employee-name" className="mb-3 block font-mono text-xs text-white/78 sm:text-sm">
            EMPLOYEE NAME
          </label>
          <input
            id="employee-name"
            name="employeeName"
            type="text"
            autoComplete="name"
            value={employeeName}
            onChange={(e) => {
              setEmployeeName(e.target.value);
              if (errors.employeeName) {
                setErrors((previous) => ({ ...previous, employeeName: undefined }));
              }
            }}
            placeholder="Enter your name..."
            className="wf-input w-full px-4 py-3 font-mono"
          />
          {errors.employeeName && (
            <div className="mt-2 font-mono text-xs text-[var(--wf-danger)]">{errors.employeeName}</div>
          )}
        </div>

        {/* Enter Button */}
        <motion.button
          type="button"
          onClick={handleEnterOffice}
          disabled={!formIsValid}
          className={`wf-btn h-14 w-full font-mono text-base sm:h-16 sm:text-lg ${
            formIsValid
              ? "wf-btn-primary"
              : "wf-btn-muted cursor-not-allowed opacity-75"
          }`}
          whileHover={formIsValid ? { y: -1 } : {}}
          whileTap={formIsValid ? { scale: 0.995 } : {}}
        >
          ENTER V-OFFICE
        </motion.button>

        {submitAttempted && !formIsValid && (
          <div className="mt-3 text-center text-xs font-mono text-white/58">
            COMPLETE NAME AND ROLE PROFILE TO CONTINUE.
          </div>
        )}

        {/* Footer info */}
        <div className="mt-7 border-t border-white/20 pt-5 text-center font-mono text-[11px] text-white/52">
          WIREFRAME: ONBOARDING LOGIN + PROFILE SETUP
        </div>
      </motion.div>
    </motion.div>
  );
}
