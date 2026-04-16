export interface RoleProfile {
  id: string;
  title: string;
  department: string;
  description: string;
  skillTags: string[];
}

export interface EmployeeProfile {
  employeeName: string;
  roleId: string;
  roleTitle: string;
  department: string;
  skillTags: string[];
  avatarIndex: number;
  avatarLabel: string;
  createdAt: string;
}

const EMPLOYEE_PROFILE_STORAGE_KEY = "vr_metaverse_employee_profile_v1";

export const roleProfiles: RoleProfile[] = [
  {
    id: "xr_engineer",
    title: "XR Engineer",
    department: "Platform Engineering",
    description: "Builds immersive 3D collaboration systems and interaction logic.",
    skillTags: ["WebXR", "TypeScript", "Realtime Systems"],
  },
  {
    id: "experience_designer",
    title: "Experience Designer",
    department: "Product Design",
    description: "Designs spatial interfaces and end-to-end user journeys in VR.",
    skillTags: ["UX Strategy", "Prototyping", "Interaction Design"],
  },
  {
    id: "community_manager",
    title: "Community Manager",
    department: "People Operations",
    description: "Facilitates team rituals, social spaces, and onboarding quality.",
    skillTags: ["Facilitation", "Communication", "Engagement"],
  },
  {
    id: "data_analyst",
    title: "Data Analyst",
    department: "Business Intelligence",
    description: "Tracks product usage, adoption signals, and milestone outcomes.",
    skillTags: ["Analytics", "Insights", "Visualization"],
  },
];

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadEmployeeProfile(): EmployeeProfile | null {
  if (!hasLocalStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(EMPLOYEE_PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as EmployeeProfile;
    if (!parsed.employeeName || !parsed.roleId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveEmployeeProfile(profile: EmployeeProfile) {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(EMPLOYEE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
