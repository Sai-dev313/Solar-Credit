import React, { useState } from 'react';
import { CheckCircle2, MapPin, ShoppingCart, Zap } from 'lucide-react';
import { MarketplaceListing } from '@/types';
import { formatCurrency, formatKwh } from '@/utils/format';

interface ListingCardProps {
  listing: MarketplaceListing;
  onPurchase: (listingId: string, kwh: number) => Promise<void>;
  /** The signed-in user's own listing: shown without buy controls */
  isOwn?: boolean;
  /** Cancel your own listing (cancel_listing) */
  onCancel?: (listingId: string) => Promise<void>;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onPurchase, isOwn = false, onCancel }) => {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [kwhAmount, setKwhAmount] = useState<number>(
    Math.min(15, listing.creditsAvailable)
  );
  const [busy, setBusy] = useState(false);

  const handleBuy = async () => {
    setBusy(true);
    try {
      await onPurchase(listing.id, kwhAmount);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4 hover:border-primary/30 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-title-md text-title-md font-bold text-on-surface">
                {listing.sellerName}
              </h4>
              {listing.verifiedSmartMeter && (
                <span title="Verified Smart Meter">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-on-surface-variant" />
              {listing.location}
            </p>
          </div>
          <span className="rounded-full bg-secondary-container/30 px-2.5 py-0.5 font-label-sm text-label-sm text-on-secondary-container">
            {listing.gridRateComparisonPct}% vs bill value
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface-container-low p-3 border border-outline-variant/15">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Available Credits
            </span>
            <p className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-1 mt-0.5">
              <Zap className="h-4 w-4 text-primary" />
              {formatKwh(listing.creditsAvailable)}
            </p>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">P2P Rate</span>
            <p className="font-title-md text-title-md font-bold text-primary mt-0.5">
              ₹{listing.pricePerKwh.toFixed(2)}{' '}
              <span className="text-xs font-normal text-on-surface-variant">/ CC</span>
            </p>
          </div>
        </div>
      </div>

      {isOwn && listing.status === 'active' ? (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary-container/40 px-3 py-2 font-label-sm text-label-sm text-on-secondary-container">
          <span>Your listing</span>
          {onCancel &&
            (confirmCancel ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onCancel(listing.id);
                    } finally {
                      setBusy(false);
                      setConfirmCancel(false);
                    }
                  }}
                  className="px-2.5 py-1 rounded-md bg-error text-on-error cursor-pointer disabled:opacity-60"
                >
                  Yes, cancel
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="px-2.5 py-1 rounded-md bg-surface-container-lowest text-on-surface cursor-pointer"
                >
                  Keep
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="underline cursor-pointer"
              >
                Cancel listing
              </button>
            ))}
        </div>
      ) : listing.status === 'active' ? (
        <div className="space-y-3 pt-2 border-t border-outline-variant/15">
          <div className="flex items-center justify-between font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Quantity to buy (CC / kWh):</span>
            <span className="font-semibold text-on-surface">
              Total: {formatCurrency(kwhAmount * listing.pricePerKwh)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={listing.creditsAvailable}
              step={0.5}
              value={kwhAmount}
              onChange={(e) =>
                setKwhAmount(
                  Math.min(listing.creditsAvailable, Math.max(0.5, Number(e.target.value)))
                )
              }
              className="w-24 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleBuy}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-container hover:opacity-95 disabled:opacity-50 text-on-primary font-label-md text-label-md px-4 py-2 transition-all cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              {busy ? 'Settling...' : 'Buy Credits'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-surface-container py-2 text-center font-label-sm text-label-sm text-on-surface-variant">
          Listing Filled
        </div>
      )}
    </div>
  );
};
