import { CREDIT_VALUE_INR } from '@/lib/constants';
import React, { useState } from 'react';
import { Filter, Search, ShoppingBag, Zap } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { SellCreditsForm } from '@/components/forms/SellCreditsForm';
import { formatKwh } from '@/utils/format';

export const MarketplacePage: React.FC = () => {
  const { profile, stats, listings, buyListing, createOffer, cancelListing } = useApp();
  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = listings.filter((item) => {
    if (onlyActive && item.status !== 'active') return false;
    if (
      search &&
      !item.sellerName.toLowerCase().includes(search.toLowerCase()) &&
      !item.location.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handlePurchase = async (listingId: string, kwh: number) => {
    setFeedback(null);
    await buyListing(listingId, kwh);
    setFeedback(`Successfully purchased ${kwh} CC (kWh) of SolarCredits! Added to your wallet.`);
  };

  const handleCancel = async (listingId: string) => {
    setFeedback(null);
    const credits = listings.find((l) => l.id === listingId)?.creditsAvailable ?? 0;
    try {
      await cancelListing(listingId);
      setFeedback(`Cancelled listing #${listingId}. ${credits} CC returned to your balance.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Could not cancel the listing');
    }
  };

  return (
    <DashboardShell portalLabel="P2P Order Book & Marketplace">
      <div className="w-full py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
              Decentralized Orderbook • CERC Compliant
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface mt-0.5">
              P2P Solar Credit Marketplace
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Bill value: <strong>₹{CREDIT_VALUE_INR.toFixed(2)} / CC</strong> •
              Average P2P price:{' '}
              <strong className="text-primary">₹{stats.p2pAvgPricePerKwh.toFixed(2)} / CC</strong>
            </p>
          </div>

          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block">
                Your Available Credits
              </span>
              <span className="font-title-md text-title-md font-bold text-on-surface">
                {formatKwh(profile.creditBalance)}
              </span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="rounded-xl border border-primary/20 bg-secondary-container/30 px-4 py-3 text-xs font-semibold text-on-secondary-container">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search producer node or microgrid zone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low pl-9 pr-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <button
                onClick={() => setOnlyActive(!onlyActive)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-label-sm text-label-sm border cursor-pointer ${
                  onlyActive
                    ? 'border-primary/20 bg-secondary-container/30 text-on-secondary-container'
                    : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                {onlyActive ? 'Showing Active Offers' : 'Showing All Offers'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onPurchase={handlePurchase}
                  isOwn={listing.sellerId === profile.id}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SellCreditsForm
              maxCredits={profile.creditBalance}
              onCreateOffer={createOffer}
            />

            <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Smart Contract Escrow Protection
              </div>
              <p className="leading-relaxed">
                When a producer lists credits, the CC tokens are locked in{' '}
                <code className="font-mono text-primary">EnergyTrading.sol</code>. Purchasing credits
                executes an atomic settlement and emits a{' '}
                <code className="font-mono text-primary">CreditsPurchased</code> event.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
