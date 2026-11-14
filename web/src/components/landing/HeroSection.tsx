import { CREDIT_VALUE_INR } from '@/lib/constants';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const [solarKw, setSolarKw] = useState<number>(5.0);
  const navigate = useNavigate();

  const minedTokens = Math.round(solarKw * 48);
  // Value of the month's credits at the agreed Rs 2 per credit
  const monthlyInr = Math.round(minedTokens * CREDIT_VALUE_INR);
  const sliderPct = ((solarKw - 1) / (20 - 1)) * 100;

  return (
    <section className="w-full px-4 md:px-8 lg:px-10 py-8 md:py-14">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Hero Narrative */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant w-fit shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-sm text-label-sm tracking-wide font-semibold text-primary uppercase">
              Built for India • Policy-Aware • Transparent Credits
            </span>
          </div>

          <h1 className="mt-4 font-display-hero text-headline-lg sm:text-[42px] sm:leading-[48px] xl:text-[52px] xl:leading-[58px] text-on-surface font-extrabold tracking-tight">
            Turn Your Rooftop Solar Power into{' '}
            <span className="text-primary underline decoration-secondary-container decoration-4 underline-offset-4">
              Real Value
            </span>
          </h1>

          <p className="mt-4 font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-2xl">
            SolarCredit is a peer-to-peer solar energy trading platform. Prosumers generate clean rooftop solar energy, mint verified SolarCredits (<code className="font-mono text-primary font-semibold">1 CC = 1 kWh</code>), and sell surplus credits directly to consumers who offset their monthly DISCOM electricity bills.
          </p>

          {/* Required Primary CTA ("Get Started") & Secondary CTA ("Explore Marketplace") */}
          <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
            <Link
              to="/auth?mode=signup"
              className="px-7 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>

            <Link
              to="/marketplace"
              className="px-6 py-3.5 rounded-full bg-surface-container-low text-primary border border-primary/20 font-label-md text-label-md font-semibold hover:bg-secondary-container/40 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Explore Marketplace</span>
            </Link>

            <a
              href="#how-it-works"
              className="px-4 py-3.5 rounded-full text-on-surface-variant hover:text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1"
            >
              <span>How It Works</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </a>
          </div>

          {/* Trust & Protocol Pill Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              CERC &amp; DISCOM Aligned
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">hub</span>
              Sepolia Smart Contract Escrow
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
              Instant BBPS Bill Offset
            </span>
          </div>
        </div>

        {/* Right Interactive Yield Simulation Slider Card (from Stitch design) */}
        <div className="lg:col-span-5 w-full max-w-xl mx-auto text-left">
          <div
            className="bg-surface-container-lowest rounded-2xl p-6 md:p-7 shadow-md border border-outline-variant/15 flex flex-col w-full"
            id="calculator"
          >
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">calculate</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Fast Yield Estimator
                  </h2>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Instant P2P solar credit simulation
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold shadow-sm">
                Live Calculator
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between font-label-md text-label-md mb-2">
                  <label htmlFor="solar-kw-slider" className="text-on-surface-variant font-medium text-sm">
                    Rooftop Solar Capacity
                  </label>
                  <span className="font-bold text-primary font-headline-sm text-xl">
                    {solarKw.toFixed(1)} kW
                  </span>
                </div>
                <div className="py-2">
                  <input
                    id="solar-kw-slider"
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={solarKw}
                    onChange={(e) => setSolarKw(parseFloat(e.target.value))}
                    className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to right, #006948 0%, #006948 ${sliderPct}%, #e2e7ff ${sliderPct}%, #e2e7ff 100%)`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" /> 1 kW (Micro)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" /> 10 kW (Home)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" /> 20 kW (RWA)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col justify-between">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                    Est. Monthly Benefit
                  </span>
                  <div className="mt-2">
                    <span className="font-headline-md text-2xl font-extrabold text-on-surface block tracking-tight">
                      ₹{monthlyInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-label-sm text-primary font-medium mt-0.5 block">
                      Net P2P + bill credit
                    </span>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col justify-between">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                    Mined SolarCredits
                  </span>
                  <div className="mt-2">
                    <span className="font-headline-md text-2xl font-extrabold text-primary block tracking-tight">
                      +{minedTokens} CC
                    </span>
                    <span className="text-xs font-label-sm text-secondary font-medium mt-0.5 block">
                      Tradable kWh tokens/mo
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-high/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    verified
                  </span>
                  <span className="font-body-sm text-xs sm:text-sm text-on-surface font-medium">
                    DISCOM sync &amp; instant P2P liquidation
                  </span>
                </div>
                <span className="font-label-sm text-[11px] font-bold text-primary uppercase tracking-wide">
                  CERC Ready
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/auth?mode=signup&role=prosumer')}
                className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Connect Meter to Claim</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
