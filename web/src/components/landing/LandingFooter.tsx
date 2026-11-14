import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <>
      {/* Edge-to-Edge CTA Banner */}
      <section className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-16">
        <div className="max-w-6xl mx-auto rounded-3xl bg-primary text-on-primary p-8 md:p-12 relative overflow-hidden shadow-xl text-center flex flex-col items-center">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary-fixed/20 blur-2xl pointer-events-none" />
          <span className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold uppercase tracking-wider mb-4">
            Start In Under 2 Minutes
          </span>
          <h2 className="font-headline-lg text-headline-md md:text-headline-lg font-extrabold max-w-2xl leading-tight">
            Ready to Make Every Ray of Sunlight Count?
          </h2>
          <p className="mt-3 font-body-lg text-body-md text-on-primary-container max-w-xl">
            Join 1,280+ Indian prosumers and clean energy buyers. Connect your inverter or start buying discounted SolarCredits today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth?mode=signup"
              className="px-7 py-3.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md font-bold hover:bg-surface-container-low transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to="/marketplace"
              className="px-6 py-3.5 rounded-full bg-primary-container/80 text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Explore Marketplace</span>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-on-primary-container font-label-sm text-label-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check</span> Free Inverter Onboarding
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check</span> No Lock-In Period
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check</span> Instant UPI &amp; BBPS Settlement
            </span>
          </div>
        </div>
      </section>

      {/* Required Section 12: Footer with Navigation and Contact Information */}
      <footer id="contact" className="w-full bg-surface-container-low border-t border-outline-variant/20 pt-12 pb-8 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-outline-variant/20">
            {/* Column 1: Brand & Mission */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                  <img
                    src="/logo.svg"
                    alt="SolarCredit Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  SolarCredit
                </span>
              </Link>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Peer-to-peer solar energy credit trading platform connecting rooftop solar prosumers with electricity consumers across India.
              </p>
              <div className="flex items-center gap-2 text-xs text-primary font-semibold pt-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Sepolia Ledger &amp; BBPS Gateway Online</span>
              </div>
            </div>

            {/* Column 2: Platform Navigation */}
            <div>
              <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mb-3">
                Platform Navigation
              </h3>
              <ul className="space-y-2 text-xs font-body-sm text-on-surface-variant">
                <li>
                  <a href="#how-it-works" className="hover:text-primary transition-colors">
                    How SolarCredit Works
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-primary transition-colors">
                    3-Step Credit Workflow
                  </a>
                </li>
                <li>
                  <a href="#roles" className="hover:text-primary transition-colors">
                    Prosumers &amp; Consumers
                  </a>
                </li>
                <li>
                  <a href="#blockchain-benefits" className="hover:text-primary transition-colors">
                    Blockchain Verification
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    Accounting Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Portals & Ledger */}
            <div>
              <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mb-3">
                Portals &amp; Ledger
              </h3>
              <ul className="space-y-2 text-xs font-body-sm text-on-surface-variant">
                <li>
                  <Link to="/marketplace" className="hover:text-primary transition-colors">
                    P2P Credit Marketplace
                  </Link>
                </li>
                <li>
                  <Link to="/auth?role=prosumer" className="hover:text-primary transition-colors">
                    Producer Portal Login
                  </Link>
                </li>
                <li>
                  <Link to="/auth?role=consumer" className="hover:text-primary transition-colors">
                    Consumer Portal Login
                  </Link>
                </li>
                <li>
                  <Link to="/bills" className="hover:text-primary transition-colors">
                    BBPS Utility Bill Settlement
                  </Link>
                </li>
                <li>
                  <Link to="/transactions" className="hover:text-primary transition-colors">
                    Transaction Audit Ledger
                  </Link>
                </li>
                <li>
                  <Link to="/blockchain" className="hover:text-primary transition-colors">
                    Sepolia Smart Contract Explorer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Information */}
            <div>
              <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mb-3">
                Contact &amp; Support
              </h3>
              <ul className="space-y-2.5 text-xs font-body-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">
                    mail
                  </span>
                  <a
                    href="mailto:support@solarcredit.in"
                    className="hover:text-primary transition-colors"
                  >
                    support@solarcredit.in
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">
                    call
                  </span>
                  <a
                    href="tel:+918004197652"
                    className="hover:text-primary transition-colors"
                  >
                    +91 (800) 419-7652 (Toll-Free)
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">
                    location_on
                  </span>
                  <span>
                    SolarCredit Cleantech Labs, HSR Layout Sector 4, Bengaluru, Karnataka 560102
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <span>© 2025 SolarCredit Protocol Inc. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/blockchain" className="hover:text-primary transition-colors">
                Smart Contract Verification
              </Link>
              <Link to="/onboarding" className="hover:text-primary transition-colors">
                DID &amp; Meter Registry
              </Link>
              <Link to="/admin" className="hover:text-primary transition-colors">
                Grid Operator Console
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
