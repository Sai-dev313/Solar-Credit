import { useEffect, type MouseEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../auth/AppProvider";
import { LandingBody } from "./LandingBody";

/** Where each link in the design leads. */
const ROUTES: Record<string, string> = {
  "onboarding-flow": "/auth?mode=signup",
  "role-producer": "/auth?mode=signup&role=producer",
  "role-consumer": "/auth?mode=signup&role=consumer",
  "prosumer-dashboard": "/app",
  "credit-marketplace": "/app",
};

export function LandingPage() {
  const { session } = useApp();
  const nav = useNavigate();
  // Scroll-reveal: elements with .reveal animate in ONCE, the first time they are scrolled to after the
  // page loads. They then stay put (scrolling back up shows them static); a refresh replays it.
  // Hooks must run before the early return below.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }),
      { threshold: 0.35 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [session]);

  if (session) return <Navigate to="/app" replace />;

  // The exported markup uses plain anchors/buttons; route them through React Router.
  const go = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // In-page links (header, bottom bar, hero): smooth-scroll to a section; "top" is the page start.
    const jump = target.closest<HTMLElement>("[data-scroll]")?.getAttribute("data-scroll");
    if (jump) {
      e.preventDefault();
      if (jump === "top") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(jump)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const el = target.closest<HTMLElement>("[data-path], #toggleGetStartedModal");
    if (!el) return;
    e.preventDefault();
    const key = el.getAttribute("data-path");
    if (key === "explore-landing") window.scrollTo({ top: 0, behavior: "smooth" });
    else if (key === "solar-analytics") document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    else nav(ROUTES[key ?? ""] ?? "/auth?mode=signup");
  };

  return (
    <div className="landing-snap flex min-h-screen flex-col bg-surface" onClick={go}>
      <LandingBody />
    </div>
  );
}
