import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useApp } from '@/hooks/useApp';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { CREDIT_VALUE_INR, DISCOM_PROVIDERS } from '@/lib/constants';
import { Select } from '@/components/common/Select';
import { Toast, ToastMessage } from '@/components/common/Toast';

type ProducerTab =
  | 'log-energy'
  | 'convert-credits'
  | 'marketplace'
  | 'pay-bill'
  | 'payment-history'
  | 'solargpt';

export const ProsumerPage: React.FC = () => {
  const {
    profile,
    stats,
    telemetry,
    listings,
    transactions,
    bills,
    logEnergy,
    claimCredits,
    createOffer,
    cancelListing,
    applyCreditsToBill,
  } = useApp();

  // null = Dashboard overview; otherwise one of the sidebar's Producer Actions
  const [activeTab, setActiveTab] = useState<ProducerTab | null>(null);
  const [generatedInput, setGeneratedInput] = useState<number>(28.5);
  const [consumedInput, setConsumedInput] = useState<number>(14.0);
  const [convertSlider, setConvertSlider] = useState<number>(25);
  const [sellAmount, setSellAmount] = useState<number>(20);
  const [sellRateInr, setSellRateInr] = useState<number>(CREDIT_VALUE_INR);
  const [discomProvider, setDiscomProvider] = useState<string>(profile.discomProvider || 'bescom');
  const [consumerId, setConsumerId] = useState<string>(profile.consumerNumber || '4029184420');
  const [ledgerSubTab, setLedgerSubTab] = useState<'bills' | 'credits'>('bills');
  const [gptPrompt, setGptPrompt] = useState<string>('');
  const [gptAnswer, setGptAnswer] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const ok = (text: string) => setToast({ text, kind: 'success' });
  const fail = (err: unknown, fallback: string) =>
    setToast({ text: err instanceof Error ? err.message : fallback, kind: 'error' });
  const closeToast = useCallback(() => setToast(null), []);

  const surplusKwh = Math.max(0, Number((generatedInput - consumedInput).toFixed(1)));
  // What the current balance is worth on a bill (1 credit = Rs 2)
  const earnedInr = Math.round(profile.creditBalance * CREDIT_VALUE_INR);
  const capacityLabel = profile.solarCapacityKw != null ? `${profile.solarCapacityKw} kWp` : 'Not set';
  // Logged surplus not yet claimed as credits (log_energy -> claim_credits)
  const unclaimedKwh = stats.unclaimedKwh ?? 0;

  // Never let the claim amount exceed what has been logged; after new energy is logged,
  // default to claiming all of it
  useEffect(() => {
    setConvertSlider((v) => (v <= 0 ? unclaimedKwh : Math.min(v, unclaimedKwh)));
  }, [unclaimedKwh]);
  const myListings = listings.filter((l) => l.sellerId === profile.id);
  const myActiveCount = myListings.filter((l) => l.status === 'active').length;
  // Listing waiting for the user to confirm cancellation
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const tabs: { id: ProducerTab; label: string; icon: string }[] = [
    { id: 'log-energy', label: 'Log Energy', icon: 'solar_power' },
    { id: 'convert-credits', label: 'Convert Credits', icon: 'change_circle' },
    { id: 'marketplace', label: 'Marketplace', icon: 'storefront' },
    { id: 'pay-bill', label: 'Pay Bill', icon: 'receipt_long' },
    { id: 'payment-history', label: 'Ledger', icon: 'history' },
    { id: 'solargpt', label: 'SolarGPT', icon: 'auto_awesome' },
  ];

  const contentRef = useRef<HTMLDivElement>(null);

  const handleSelectTab = (id: string) => {
    setActiveTab(id as ProducerTab);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogEnergy = async () => {
    if (surplusKwh <= 0) {
      setToast({ text: 'No surplus to log: generation must be higher than home use.', kind: 'error' });
      return;
    }
    try {
      await logEnergy(surplusKwh);
      ok(`Logged ${surplusKwh} kWh of surplus. Claim it as credits in Convert Credits.`);
    } catch (err) {
      fail(err, 'Could not log energy');
    }
  };

  const handleConvertMint = async () => {
    if (convertSlider <= 0) return;
    try {
      await claimCredits(convertSlider);
      ok(`Claimed ${convertSlider} CC (worth ₹${(convertSlider * CREDIT_VALUE_INR).toFixed(2)} on a bill).`);
    } catch (err) {
      fail(err, 'Could not claim credits');
    }
  };

  const handleCreateListing = async () => {
    try {
      await createOffer(sellAmount, Number(sellRateInr.toFixed(2)));
      ok(`Listed ${sellAmount} CC on the P2P Exchange at ₹${sellRateInr.toFixed(2)}/CC.`);
    } catch (err) {
      fail(err, 'Could not list credits');
    }
  };

  const handleCancelListing = async (listingId: string, credits: number) => {
    try {
      await cancelListing(listingId);
      ok(`Cancelled listing #${listingId}. ${credits} CC returned to your balance.`);
    } catch (err) {
      fail(err, 'Could not cancel the listing');
    } finally {
      setConfirmCancelId(null);
    }
  };

  const handlePayBillWithCredits = async () => {
    if (bills[0]) {
      try {
        const applied = Math.min(25, profile.creditBalance);
        await applyCreditsToBill(bills[0].id, applied);
        ok(
          `Applied ${applied} CC (₹${(applied * CREDIT_VALUE_INR).toFixed(2)}) via BBPS to ${discomProvider.toUpperCase()} account #${consumerId}.`
        );
      } catch (err) {
        fail(err, 'Bill offset error');
      }
    }
  };

  const handleAskSolarGpt = () => {
    if (!gptPrompt.trim()) return;
    setGptAnswer(
      `SolarGPT Advisory for "${gptPrompt}": Based on your ${capacityLabel} array and current BESCOM ToD tariff schedule, exporting between 11:30 AM – 3:00 PM yields +18.4% higher P2P demand. Each credit is worth ₹${CREDIT_VALUE_INR} on a bill. Your current balance of ${profile.creditBalance} CC can offset ₹${earnedInr.toLocaleString('en-IN')} on your upcoming BBPS invoice.`
    );
    setGptPrompt('');
  };

  const gptFaqs = [
    {
      icon: 'help_outline',
      q: 'How did I earn these credits?',
      a: 'You earn SolarCredits (CC) by producing more rooftop solar power than your home consumes. When that surplus electricity flows back into the local distribution grid, your smart meter logs the kilowatt-hours. 1 kWh of verified clean surplus equals 1 tradeable Credit Token.',
    },
    {
      icon: 'eco',
      q: "What's my lifetime impact?",
      a: 'Your residential solar array prevents grid dependence on coal and gas thermal power plants. On average in India, every 1 kWh of solar generation mitigates approximately 0.82 kg of CO2 equivalent emissions while building resilience in your localized power cluster.',
    },
    {
      icon: 'swap_horiz',
      q: 'What happens if I sell vs use credits?',
      a: 'If you sell on the P2P Marketplace, you receive cash directly to your bank account at the price you set. If you use them via BBPS, each credit takes ₹2 off your monthly electricity invoice, with no platform commission.',
    },
    {
      icon: 'electrical_services',
      q: 'Where did my solar energy go?',
      a: 'Physical surplus electrons follow the path of least resistance to your closest physical neighbors via the secondary low-voltage transformer network. SolarCredit ledger tracks the financial and regulatory ownership token so you get rewarded for your green contribution.',
    },
  ];

  return (
    <DashboardShell
      portalLabel="Producer Portal"
      navItems={tabs}
      navTitle="Producer Actions"
      activeNavId={activeTab ?? undefined}
      onNavSelect={handleSelectTab}
      onDashboardSelect={() => setActiveTab(null)}
    >
      <div className="flex flex-col w-full pb-16">
        {/* Top Ambient Glow & Header */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative pt-6 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Prosumer Node 01 • Live Telemetry
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px] text-primary signal-pulse">sensors</span>
                  Grid Inverter Paired
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">sync</span>
                  Auto-Sync 15m
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Producer Dashboard
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Track your solar energy and earn credits through verified rooftop surplus generation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">solar_power</span>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">
                    Active Array
                  </div>
                  <div className="font-label-md text-label-md text-on-surface">
                    {capacityLabel}
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">
                    Registry State
                  </div>
                  <div className="font-label-md text-label-md text-primary">BBPS Certified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Toast message={toast} onClose={closeToast} />

        {/* Twin Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Card 1: Credits Balance */}
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-on-surface-variant">
                  Credits Balance
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display-hero text-display-hero text-on-surface font-extrabold tracking-tight">
                    {profile.creditBalance}
                  </span>
                  <span className="font-headline-md text-headline-md text-primary">CC</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-on-secondary-container shadow-sm">
                <span className="material-symbols-outlined text-[26px]">eco</span>
              </div>
            </div>
            <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container-low/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[18px] text-outline">
                  trending_up
                </span>
                <span>
                  Surplus exported:{' '}
                  <strong className="text-on-surface font-label-md">
                    {stats.todayExportedKwh} kWh
                  </strong>
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>1 CC = 1
                kWh surplus
              </span>
            </div>
          </div>

          {/* Card 2: Earned by Credits */}
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-on-surface-variant">
                  Earned by Credits
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display-hero text-display-hero text-on-surface font-extrabold tracking-tight">
                    ₹{earnedInr.toLocaleString('en-IN')}
                  </span>
                  <span className="font-headline-md text-headline-md text-on-surface-variant">
                    INR
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[26px]">payments</span>
              </div>
            </div>
            <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container-low/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  show_chart
                </span>
                <span>
                  Bill value:{' '}
                  <strong className="text-on-surface font-label-md">₹{CREDIT_VALUE_INR.toFixed(2)} / CC</strong>
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified P2P Registry
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area — selected from the sidebar's Producer Actions */}
        <div ref={contentRef} className="w-full space-y-8 scroll-mt-20">
          {/* Dashboard overview (nothing selected in the sidebar) */}
          {activeTab === null && <EnergyChart data={telemetry} />}

          {/* PANEL 1: Log Today's Energy */}
          {activeTab === 'log-energy' && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                        Generation Logging
                      </span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                      Log Today&apos;s Energy
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Input your bi-directional meter readings or sync via connected IoT smart meter.
                    </p>

                    <div className="mt-6 flex flex-col gap-4">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-2">
                          Gross PV Output (Power Generated)
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-on-surface-variant material-symbols-outlined text-[20px]">
                            sunny
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            value={generatedInput}
                            onChange={(e) => setGeneratedInput(Number(e.target.value))}
                            className="w-full pl-11 pr-16 py-3 bg-surface-container-low rounded-xl font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                          <span className="absolute right-3.5 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-md font-label-sm text-label-sm">
                            kWh
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-2">
                          Self-Consumption (Power Used at Home)
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-on-surface-variant material-symbols-outlined text-[20px]">
                            home
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            value={consumedInput}
                            onChange={(e) => setConsumedInput(Number(e.target.value))}
                            className="w-full pl-11 pr-16 py-3 bg-surface-container-low rounded-xl font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                          <span className="absolute right-3.5 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-md font-label-sm text-label-sm">
                            kWh
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedInput(34.2);
                            setConsumedInput(14.7);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary">
                            sensors
                          </span>
                          <span>Simulate Smart Meter Feed</span>
                        </button>
                        <span className="font-body-sm text-body-sm text-on-surface-variant italic">
                          Populates live inverter telemetry
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6">
                    <button
                      type="button"
                      onClick={handleLogEnergy}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-all font-label-md text-label-md shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        energy_savings_leaf
                      </span>
                      <span>Log Energy • Verify Surplus</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry Summary Widget */}
                <div className="w-full lg:w-96 flex flex-col justify-between p-6 rounded-2xl bg-surface-container-low">
                  <div>
                    <div className="flex items-center justify-between pb-4">
                      <span className="font-label-md text-label-md text-on-surface">
                        Calculated Net Export
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm">
                        Dynamic Calc
                      </span>
                    </div>
                    <div className="my-4 text-center py-6 bg-surface-container-lowest rounded-xl shadow-sm">
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        Eligible for Tokenization
                      </div>
                      <div className="font-display-hero text-on-surface font-extrabold mt-1">
                        {surplusKwh.toFixed(1)}
                      </div>
                      <div className="font-label-md text-label-md text-primary mt-1 font-semibold">
                        kWh Surplus
                      </div>
                    </div>
                    <div className="space-y-3 font-body-sm text-body-sm">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Equivalent CC Credits</span>
                        <span className="font-semibold text-on-surface">
                          {surplusKwh.toFixed(1)} CC
                        </span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Estimated Market Value</span>
                        <span className="font-semibold text-primary">
                          ₹{(surplusKwh * CREDIT_VALUE_INR).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Discom Grid Offset (Avoided CO₂)</span>
                        <span className="font-semibold text-on-surface">
                          {(surplusKwh * 0.82).toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-3 rounded-xl bg-surface-container flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      verified_user
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Data verified by IEEE 2030.5 smart inverter protocol prior to CC minting.
                    </p>
                  </div>
                </div>
              </div>

              <EnergyChart data={telemetry} />
            </div>
          )}

          {/* PANEL 2: Convert to Credits */}
          {activeTab === 'convert-credits' && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                    Credit Minting Portal
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  Convert Surplus Energy into Credits
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Transform verified surplus kilowatt-hours into tradeable and redeemable SolarCredit (CC) tokens.
                </p>

                <div className="mt-6 p-6 rounded-2xl bg-surface-container-low flex flex-col gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="font-label-md text-label-md text-on-surface">
                        Credits to claim
                      </label>
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">
                        {convertSlider} kWh
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={unclaimedKwh}
                      step={0.5}
                      disabled={unclaimedKwh <= 0}
                      value={convertSlider}
                      onChange={(e) => setConvertSlider(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[...[10, 25, 50].filter((p) => p < unclaimedKwh), unclaimedKwh].filter((p) => p > 0).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setConvertSlider(preset)}
                          className={`px-3 py-1.5 rounded-xl font-label-sm text-label-sm transition-colors cursor-pointer ${
                            convertSlider === preset
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                          }`}
                        >
                          {preset === unclaimedKwh ? `All ${preset} kWh` : `${preset} kWh`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Logged surplus not yet claimed
                      </span>
                      <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                        {unclaimedKwh} kWh
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {unclaimedKwh > 0 ? '1 kWh = 1 credit' : 'Log energy first to claim credits'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Bill value @ ₹{CREDIT_VALUE_INR.toFixed(2)} / CC
                      </span>
                      <div className="font-headline-sm text-headline-sm text-primary font-bold mt-1">
                        ₹{(convertSlider * CREDIT_VALUE_INR).toFixed(2)}
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Instant liquid trading value
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConvertMint}
                      disabled={convertSlider <= 0}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-all font-label-md text-label-md shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[20px]">token</span>
                      <span>Claim {convertSlider} Credits</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 3: Marketplace Quick Portal */}
          {activeTab === 'marketplace' && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                      P2P Energy Marketplace
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                        Active Peer Exchange
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Sell your generated credits directly to commercial buyers and local consumers.
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-secondary-container/30 rounded-xl flex items-center gap-2 self-start">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-label-md text-label-md text-on-secondary-container">
                        Bill value: <strong>₹{CREDIT_VALUE_INR.toFixed(2)} / CC</strong>
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-surface-container-low p-6 mb-6">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-4">
                      List Your Credits for Sale ({myActiveCount} Active)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                          Credits to List (CC)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={profile.creditBalance}
                          value={sellAmount}
                          onChange={(e) => setSellAmount(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                          Ask Price (₹ / CC)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          value={sellRateInr}
                          onChange={(e) => setSellRateInr(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateListing}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        <span>List Credits for Sale</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {myListings.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          item.status === 'active' ? '' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">store</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-label-md text-label-md text-on-surface font-bold">
                              Listing #{item.id} •{' '}
                              {item.status === 'active'
                                ? `${item.creditsAvailable} of ${item.initialCredits} CC left`
                                : item.status === 'filled'
                                  ? 'Sold out'
                                  : 'Cancelled'}
                            </div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                              ₹{item.pricePerKwh.toFixed(2)} / CC • Tx {item.txHash}
                            </div>
                          </div>
                        </div>

                        {item.status === 'active' &&
                          (confirmCancelId === item.id ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Return {item.creditsAvailable} CC?
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCancelListing(item.id, item.creditsAvailable)}
                                className="px-3 py-1.5 rounded-lg bg-error text-on-error font-label-sm text-label-sm cursor-pointer"
                              >
                                Yes, cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmCancelId(null)}
                                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm cursor-pointer"
                              >
                                Keep
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(item.id)}
                              className="shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              Cancel listing
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-Time Market Depth Sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-4 p-5 rounded-2xl bg-surface-container-low">
                  <div className="font-label-md text-label-md text-on-surface font-bold">
                    Recent Network Trades
                  </div>
                  <div className="space-y-2">
                    {[
                      { cc: '120 CC', rate: '₹1.92', time: '2m ago' },
                      { cc: '85 CC', rate: '₹1.90', time: '7m ago' },
                      { cc: '350 CC', rate: '₹1.88', time: '18m ago' },
                    ].map((tr, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            arrow_upward
                          </span>
                          <span className="text-on-surface font-medium">{tr.cc}</span>
                        </div>
                        <span className="text-on-surface-variant">{tr.rate}</span>
                        <span className="text-outline text-label-sm font-label-sm">{tr.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-surface-container rounded-xl text-on-surface-variant font-label-sm text-label-sm">
                    DISCOM wheeling charges (₹0.35/kWh) auto-deducted at settlement.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 4: Pay Electricity Bill */}
          {activeTab === 'pay-bill' && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                    Bharat Bill Payment System (BBPS)
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  Pay Electricity Bill with Clean Credits
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Offset your residential power tariff directly using earned SolarCredit tokens or payment gateway.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <div>
                    <label
                      htmlFor="producer-discom"
                      className="block font-label-md text-label-md text-on-surface mb-2"
                    >
                      Electricity Provider / DISCOM
                    </label>
                    <Select
                      id="producer-discom"
                      value={discomProvider}
                      onChange={setDiscomProvider}
                      options={DISCOM_PROVIDERS}
                      placeholder="Select your provider"
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2">
                      Consumer Number / Account ID
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-on-surface-variant material-symbols-outlined text-[20px]">
                        badge
                      </span>
                      <input
                        type="text"
                        value={consumerId}
                        onChange={(e) => setConsumerId(e.target.value)}
                        placeholder="Enter 10-digit consumer account ID"
                        className="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-xl font-body-md text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      info
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Apply earned clean energy credits directly against your monthly utility bill via BBPS. If balance is 0 CC, full tariff can be settled through UPI/Netbanking.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handlePayBillWithCredits}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-all font-label-md text-label-md shadow-md cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                      <span>Redeem 25 CC on Live BBPS Bill</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 5: Payment History & Ledger */}
          {activeTab === 'payment-history' && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                      Audit Ledger
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    Payment History &amp; Settlements
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Immutable settlement records for utility bill clearances and credit sales.
                  </p>
                </div>

                <div className="inline-flex p-1 bg-surface-container rounded-xl self-start">
                  <button
                    type="button"
                    onClick={() => setLedgerSubTab('bills')}
                    className={`px-3.5 py-1.5 rounded-lg font-label-sm text-label-sm cursor-pointer ${
                      ledgerSubTab === 'bills'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Electricity Bills
                  </button>
                  <button
                    type="button"
                    onClick={() => setLedgerSubTab('credits')}
                    className={`px-3.5 py-1.5 rounded-lg font-label-sm text-label-sm cursor-pointer ${
                      ledgerSubTab === 'credits'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Credit Transactions
                  </button>
                </div>
              </div>

              {ledgerSubTab === 'bills' ? (
                <div className="space-y-3">
                  {bills.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">receipt</span>
                        </div>
                        <div>
                          <div className="font-label-md text-label-md text-on-surface font-bold">
                            {b.billingPeriod} • {b.totalConsumptionKwh} kWh
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">
                            Credits Redeemed: {b.creditsAppliedKwh} CC
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold capitalize">
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">sync_alt</span>
                        </div>
                        <div>
                          <div className="font-label-md text-label-md text-on-surface font-bold">
                            {tx.type} • {tx.creditsKwh} CC
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">
                            {tx.counterpartyName} • {tx.txHash}
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold">
                        Block #{tx.blockNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL 6: SolarGPT Insights & Advisory */}
          {activeTab === 'solargpt' && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
              <div className="max-w-4xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                    Generative CleanTech Intelligence
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  SolarGPT Insights &amp; Advisory
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Context-aware solar yield forecasts, tariff arbitrage recommendations, and regulatory net-metering advice.
                </p>

                <div className="mt-6 relative flex items-center">
                  <span className="absolute left-4 text-primary material-symbols-outlined text-[22px]">
                    smart_toy
                  </span>
                  <input
                    type="text"
                    value={gptPrompt}
                    onChange={(e) => setGptPrompt(e.target.value)}
                    placeholder="Ask SolarGPT about your solar yield, net-metering tariffs, or DISCOM settlement..."
                    className="w-full pl-12 pr-28 py-3.5 bg-surface-container-low rounded-2xl font-body-md text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAskSolarGpt}
                    className="absolute right-2 px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                  >
                    Ask AI
                  </button>
                </div>

                {gptAnswer && (
                  <div className="mt-4 p-4 rounded-2xl bg-surface-container-low border border-primary/20 text-on-surface font-body-md text-body-md">
                    <div className="flex items-center gap-2 text-primary font-label-md text-label-md mb-1">
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      <span>SolarGPT Analysis</span>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">{gptAnswer}</p>
                  </div>
                )}

                <div className="mt-8">
                  <div className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4">
                    Frequently Asked Questions
                  </div>
                  <div className="space-y-3">
                    {gptFaqs.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-surface-container-low overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-4 text-left font-label-md text-label-md text-on-surface hover:text-primary transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px] text-primary">
                              {item.icon}
                            </span>
                            {item.q}
                          </span>
                          <span
                            className={`material-symbols-outlined text-outline transition-transform duration-200 ${
                              openFaq === idx ? 'rotate-180' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        {openFaq === idx && (
                          <div className="px-5 pb-4 font-body-md text-body-md text-on-surface-variant">
                            {item.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};
