import React, { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'Do I need to install any hardware or replace my bidirectional meter?',
    a: 'No extra hardware is required! SolarCredit connects directly to your existing solar inverter via its manufacturer cloud API (compatible with SolarEdge, Enphase, Sungrow, Growatt, Fronius, Havells, and Luminous) or through approved DISCOM smart meter data gateways.',
  },
  {
    q: 'How does this work alongside my state DISCOM net-metering tariff?',
    a: 'SolarCredit operates synchronously with your local DISCOM contract. Your regular net-metering credits continue as normal; SolarCredit verifies surplus power generation and mints verifiable SolarCredits (1 CC = 1 kWh) that can be traded peer-to-peer or redeemed via BBPS.',
  },
  {
    q: 'How fast are payouts credited to my bank account when I sell credits?',
    a: 'Once a consumer purchases your listed SolarCredits on the P2P Marketplace, smart contract escrow releases settlement immediately and payouts are credited via UPI or IMPS within 4 to 12 hours.',
  },
  {
    q: 'Can residents of apartment complexes or renters without rooftops join?',
    a: 'Yes! Renters and apartment residents can join as Consumers to buy discounted SolarCredits from neighborhood producers and reduce their monthly electricity bills—without owning solar panels.',
  },
  {
    q: 'How does blockchain verification prevent double-counting of solar energy?',
    a: 'Every SolarCredit is minted on the Sepolia EnergyTrading smart contract only when verified smart meter telemetry confirms surplus export. When a credit is applied to an electricity bill, it is cryptographically burned/redeemed on-chain so it can never be reused.',
  },
];

export const FaqSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full px-4 md:px-8 lg:px-10 py-10 md:py-14">
      <div className="max-w-4xl mx-auto flex flex-col">
        <div className="text-center mb-8">
          <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest">
            Clear Answers
          </span>
          <h2 className="mt-1 font-headline-lg text-headline-md md:text-headline-lg font-bold text-on-surface">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 font-body-md text-body-sm text-on-surface-variant">
            Everything you need to know about P2P solar credit trading, smart meters, and bill offsets.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={f.q}
                className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-headline-sm text-[16px] md:text-headline-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{f.q}</span>
                  <span
                    className={`material-symbols-outlined text-primary text-[20px] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-on-surface-variant font-body-sm text-body-sm leading-relaxed border-t border-outline-variant/10 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
