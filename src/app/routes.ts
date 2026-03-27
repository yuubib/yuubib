import { createBrowserRouter } from "react-router";
import { ScreenSelector } from "./components/wireframe-screens/ScreenSelector";
import { OnboardingLogin } from "./components/wireframe-screens/OnboardingLogin";
import { VirtualOfficeLobby } from "./components/wireframe-screens/VirtualOfficeLobby";
import { SocialHub } from "./components/wireframe-screens/SocialHub";
import { CompanyHistoryBoard } from "./components/wireframe-screens/CompanyHistoryBoard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ScreenSelector,
  },
  {
    path: "/onboarding",
    Component: OnboardingLogin,
  },
  {
    path: "/lobby",
    Component: VirtualOfficeLobby,
  },
  {
    path: "/social",
    Component: SocialHub,
  },
  {
    path: "/history",
    Component: CompanyHistoryBoard,
  },
]);
