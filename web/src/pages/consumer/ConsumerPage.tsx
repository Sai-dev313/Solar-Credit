import React, { useCallback, useRef, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useApp } from '@/hooks/useApp';
import { CREDIT_VALUE_INR, DISCOM_PROVIDERS } from '@/lib/constants';
import { Select } from '@/components/common/Select';
import { Toast, ToastMessage } from '@/components/common/Toast';

type ConsumerTab = 'buy-credits' | 'pay-bill' | 'payment-history' | 'solargpt';

export const ConsumerPage: React.FC = () => {
  const { profile, listings, bills, transactions, buyListing, applyCreditsToBill } = useApp();
  // null = Dashboard overview; otherwise one of the sidebar's Consumer Actions
  const [activeTab, setActiveTab] = useState<ConsumerTab | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [provider, setProvider] = useState<string>(profile.discomProvider || 'bescom');
  const [consumerNum, setConsumerNum] = useState<string>(profile.consumerNumber || '1049281720');
  const [bbpsMessage, setBbpsMessage] = useState<string | null>(null);
  const [historySubTab, setHistorySubTab] = useState<'bills' | 'credits'>('bills');
  const [gptInput, setGptInput] = useState<string>('');
  const [gptReply, setGptReply] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  // What the current balance is worth on a bill (1 credit = Rs 2)
  const potentialSavingsInr = Math.round(profile.creditBalance * CREDIT_VALUE_INR);
  // Offers from other producers only (you can't buy your own listing)
  const activeListings = listings.filter((l) => l.status === 'active' && l.sellerId !== profile.id);

  const tabs: { id: ConsumerTab; title: string; sub: string; icon: string }[] = [
    {
      id: 'buy-credits',
      title: 'Buy Credits',
      sub: 'P2P Solar Marketplace',
      icon: 'shopping_cart',
    },
    {
      id: 'pay-bill',
      title: 'Pay Electricity Bill',
      sub: 'BBPS Bill Offset',
      icon: 'bolt',
    },
    {
      id: 'payment-history',
      title: 'Payment History',
      sub: 'Settlement Ledger',
      icon: 'receipt_long',
    },
    {
      id: 'solargpt',
      title: 'SolarGPT',
      sub: 'AI Cleantech Advisory',
      icon: 'smart_toy',
    },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id as ConsumerTab);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBuyFromPool = async (listingId: string, kwh: number) => {
    try {
      await buyListing(listingId, kwh);
      setToast({ text: `Bought ${kwh} CC for ₹${(kwh * (listings.find((l) => l.id === listingId)?.pricePerKwh ?? 0)).toFixed(2)}. Added to your balance.`, kind: 'success' });
    } catch (err) {
      setToast({ text: err instanceof Error ? err.message : 'Purchase failed', kind: 'error' });
    }
  };

  const handleFetchAndOffsetBill = async () => {
    if (!provider || !consumerNum) {
      setBbpsMessage('Please select your provider and enter your 10-digit Consumer Number.');
      return;
    }
    if (bills[0] && profile.creditBalance >= 20) {
      await applyCreditsToBill(bills[0].id, 20);
      setBbpsMessage(
        `BBPS Verified for #${consumerNum}: Applied 20 CC clean energy offset (Saved ₹${20 * CREDIT_VALUE_INR} on current DISCOM cycle).`
      );
    } else {
      setBbpsMessage(
        `Connected with Bharat BillPay System (BBPS) node for ${provider.toUpperCase()}. Account #${consumerNum} verified.`
      );
    }
  };

  const handleAskAi = () => {
    if (!gptInput.trim()) return;
    setGptReply(
      `Analyzing real-time grid conditions and consumer tariff schedules for "${gptInput}"... Each SolarCredit takes ₹${CREDIT_VALUE_INR} off your bill, and producer offers are currently priced just below that.`
    );
    setGptInput('');
  };

  const faqs = [
    {
      q: 'How does SolarCredit offset my monthly DISCOM bill?',
      a: 'SolarCredit settles directly through the National BBPS network. Each verified credit you redeem deducts exact kWh unit energy charges from your connected DISCOM bill before payment clearance.',
    },
    {
      q: 'What is the pegging ratio for 1 CC in INR?',
      a: '1 CC corresponds to 1 kWh of certified solar energy. Pricing adjusts dynamically to match regional DISCOM non-peak unit rates, offering a guaranteed discount relative to commercial standard tariffs.',
    },
    {
      q: 'Is my grid connection eligible under open-access?',
      a: 'All retail and industrial consumer meters registered with supported DISCOMs under green energy open-access rules can redeem SolarCredits without any physical rooftop hardware installation.',
    },
    {
      q: 'Can I transfer unused credits to another consumer node?',
      a: 'Yes. Unused Clean Energy Credits in your balance can be transferred to any peer consumer node on the SolarCredit network or held indefinitely across upcoming billing cycles without expiration.',
    },
  ];

  return (
    <DashboardShell
      portalLabel="Consumer Portal"
      navItems={tabs.map((t) => ({ id: t.id, label: t.title, icon: t.icon }))}
      navTitle="Consumer Actions"
      activeNavId={activeTab ?? undefined}
      onNavSelect={handleSelectTab}
      onDashboardSelect={() => setActiveTab(null)}
    >
      <div className="flex flex-col w-full pb-16">
        {/* Top Meta Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-surface-container-high/60">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Consumer Node • Live Sync
              </span>
              <span className="text-outline-variant font-label-sm text-label-sm">/</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                DISCOM BBPS Enabled
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Consumer Dashboard
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Use clean energy credits to save directly on your electricity bills through verifiable micro-grid settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container-lowest shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Account Type
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Verified Consumer
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container-lowest shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  National Grid BBPS
                </span>
                <span className="font-label-md text-label-md text-primary font-semibold">
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        <Toast message={toast} onClose={closeToast} />

        {/* Hero Metric Card: Credits Balance */}
        <div className="mt-8 w-full bg-surface-container-lowest rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-2 z-10">
            <div className="flex items-center gap-2.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Credits Balance
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                1 CC = 1 kWh clean credit
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display-hero text-display-hero text-on-surface tracking-tight font-extrabold">
                {profile.creditBalance}
              </span>
              <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                CC
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-primary text-[18px]">savings</span>
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">
                = ₹{potentialSavingsInr.toLocaleString('en-IN')} potential bill savings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 z-10">
            <div className="flex-col items-end hidden md:flex text-right">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Surplus Offset Pool
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {profile.creditBalance} kWh Allocated
              </span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[34px]">currency_exchange</span>
            </div>
          </div>
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none" />
        </div>

        {/* Interactive Content Panels — selected from the sidebar's Consumer Actions */}
        <div ref={contentRef} className="mt-8 scroll-mt-20">
          {/* Dashboard overview (nothing selected in the sidebar) */}
          {activeTab === null && (
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                  Recent Activity
                </h2>
                <button
                  type="button"
                  onClick={() => handleSelectTab('payment-history')}
                  className="font-label-md text-label-md text-primary hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>
              {transactions.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No transactions yet. Buy credits from the sidebar to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <span className="font-label-md text-label-md font-bold text-on-surface">
                          {tx.type} • {tx.creditsKwh} CC
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {tx.counterpartyName} • {tx.txHash}
                        </p>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View 1: Buy Credits */}
          {activeTab === 'buy-credits' && (
            <div className="flex flex-col gap-5 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm">
              <div>
                <h2 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface tracking-tight">
                  <span className="material-symbols-outlined text-[26px] text-primary">shopping_cart</span>
                  Buy Credits
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Purchase credits from producers to save on your bills
                </p>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant">
                Your cash balance:{' '}
                <strong className="text-on-surface">
                  ₹{profile.fiatBalanceInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </strong>
              </p>

              {activeListings.length === 0 ? (
                <p className="rounded-2xl bg-surface-container-low px-5 py-6 text-center font-body-md text-body-md text-on-surface-variant">
                  No credits for sale right now. Check back soon.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {activeListings.map((item) => {
                    const total = Number((item.creditsAvailable * item.pricePerKwh).toFixed(2));
                    const canAfford = total <= profile.fiatBalanceInr;
                    return (
                      <li
                        key={item.id}
                        className="rounded-2xl bg-surface-container-low px-4 py-4 sm:px-5 flex items-center gap-3 sm:gap-4"
                      >
                        <div className="w-11 h-11 shrink-0 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[22px]">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-label-md text-label-md text-on-surface font-semibold">
                            {item.creditsAvailable} credits available
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">
                            @ ₹{item.pricePerKwh.toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <button
                            type="button"
                            disabled={!canAfford}
                            title={canAfford ? undefined : 'Not enough cash balance'}
                            onClick={() => handleBuyFromPool(item.id, item.creditsAvailable)}
                            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-on-primary-fixed-variant transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Buy Now
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* View 2: Pay Electricity Bill */}
          {activeTab === 'pay-bill' && (
            <div className="flex flex-col gap-6 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3.5 pb-6 border-b border-surface-container-high/60">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">bolt</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                    Pay Electricity Bill
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Use your purchased clean energy credits to reduce your gross tariff via Bharat BillPay (BBPS)
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="consumer-discom"
                    className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-semibold"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      domain
                    </span>
                    <span>Electricity Provider</span>
                  </label>
                  <Select
                    id="consumer-discom"
                    value={provider}
                    onChange={setProvider}
                    options={DISCOM_PROVIDERS}
                    placeholder="Select your provider"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      badge
                    </span>
                    <span>Consumer Number / CA Number</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={consumerNum}
                    onChange={(e) => setConsumerNum(e.target.value)}
                    placeholder="Enter 10-digit consumer number"
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline-variant font-body-md text-body-md rounded-xl px-4 py-3.5 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                    Found on top-right of your physical or digital DISCOM electricity bill
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleFetchAndOffsetBill}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-surface-tint transition-all shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">receipt</span>
                    <span>Fetch Bill &amp; Redeem 20 CC</span>
                  </button>
                </div>

                {bbpsMessage && (
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 flex items-start gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        BBPS Verification
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {bbpsMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View 3: Payment History */}
          {activeTab === 'payment-history' && (
            <div className="flex flex-col gap-6 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-container-high/60 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                      Payment History
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Settlement ledger of processed utility invoices and peer credit clearing events
                    </p>
                  </div>
                </div>

                <div className="inline-flex p-1 bg-surface-container rounded-xl">
                  <button
                    type="button"
                    onClick={() => setHistorySubTab('bills')}
                    className={`px-4 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 cursor-pointer ${historySubTab === 'bills'
                        ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>Electricity Bills</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistorySubTab('credits')}
                    className={`px-4 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 cursor-pointer ${historySubTab === 'credits'
                        ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                    <span>Credit Transactions</span>
                  </button>
                </div>
              </div>

              {historySubTab === 'bills' ? (
                <div className="space-y-3">
                  {bills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between"
                    >
                      <div>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {bill.billingPeriod}
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Consumption: {bill.totalConsumptionKwh} kWh • Offset:{' '}
                          {bill.creditsAppliedKwh} CC
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold capitalize">
                        {bill.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between"
                    >
                      <div>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {tx.type} • {tx.creditsKwh} CC
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {tx.counterpartyName} • {tx.txHash}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View 4: SolarGPT */}
          {activeTab === 'solargpt' && (
            <div className="flex flex-col gap-6 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-container-high/60 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                      SolarGPT Insights
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Generative Cleantech Intelligence advisory for electricity bill savings and clean power offset
                    </p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>AI Assistant • Offline Grid Cache</span>
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-surface-container-high/60 focus-within:border-primary">
                  <input
                    type="text"
                    value={gptInput}
                    onChange={(e) => setGptInput(e.target.value)}
                    placeholder="Ask SolarGPT about your electricity bill savings or clean power offset..."
                    className="flex-1 bg-transparent px-3 py-2 text-on-surface font-body-md text-body-md placeholder:text-outline-variant focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAskAi}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint transition-all shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Ask AI</span>
                  </button>
                </div>

                {gptReply && (
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                      smart_toy
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface">{gptReply}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {faqs.map((f, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-surface-container-low overflow-hidden border border-surface-container-high/60"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-4 font-label-md text-label-md text-on-surface font-semibold hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span>{f.q}</span>
                      <span
                        className={`material-symbols-outlined transition-transform duration-200 text-on-surface-variant ${openFaq === idx ? 'rotate-180' : ''
                          }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {openFaq === idx && (
                      <div className="px-4 pb-4 font-body-sm text-body-sm text-on-surface-variant">
                        {f.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Educational Trust Card at Page Bottom */}
        <div className="mt-8 rounded-2xl bg-surface-container-low p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[26px]">energy_savings_leaf</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Decentralized Clean Energy Accounting
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Direct consumer-to-producer settlement under national open-access and net-metering regulations.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              Policy-compliant
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              256-bit Encrypted
            </span>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
