import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppStateProvider } from "./state/AppStateContext";
import { ToastHost } from "./components/app/ToastHost";

export default function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
      <ToastHost />
    </AppStateProvider>
  );
}
