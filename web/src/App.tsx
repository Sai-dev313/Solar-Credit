import { Route, Routes } from "react-router-dom";
import { AppProvider } from "./features/auth/AppProvider";
import { ToastProvider } from "./components/ui";
import { DashLayout } from "./features/dashboard/DashLayout";
import { LandingPage } from "./features/landing/LandingPage";
import { AuthPage } from "./features/auth/AuthPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ProofPage } from "./features/ledger/ProofPage";
import { ProfilePage } from "./features/auth/ProfilePage";

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/proof/:hash" element={<ProofPage />} />
          <Route path="/app" element={<DashLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<div className="grid min-h-screen place-items-center bg-surface text-center"><div><h1 className="font-headline-lg text-5xl font-extrabold">404</h1><p className="mt-2 text-on-surface-variant">That page does not exist.</p><a href="/" className="mt-4 inline-block font-bold text-primary underline">Back home</a></div></div>} />
        </Routes>
      </AppProvider>
    </ToastProvider>
  );
}
