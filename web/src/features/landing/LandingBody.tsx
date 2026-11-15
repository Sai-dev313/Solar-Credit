// Generated from the Stitch design export, then wired by hand where marked.

/** Short one-liners about the app, scrolled in the divider strip under the hero. */
const STRIP_ITEMS = [
  "About SolarCredit",
  "Turn rooftop solar surplus into credits",
  "1 unit = 1 SolarCredit",
  "Pay electricity bills with credits",
  "Trade with your neighbours",
  "Every action proven on Sepolia",
  "Built for India",
];

/** A slightly tilted band that scrolls right to left, marking the end of the hero. */
function DividerStrip() {
  const row = (key: string) =>
    STRIP_ITEMS.map((t, i) => (
      <span
        key={`${key}-${i}`}
        className="mr-4 inline-flex shrink-0 items-center gap-3 rounded-xl border border-dashed border-on-primary/40 px-5 py-2.5 font-label-md text-label-md text-on-primary/95 whitespace-nowrap"
      >
        <span aria-hidden className="inline-block h-2.5 w-2.5 rotate-45 bg-secondary-container" />
        {t}
      </span>
    ));
  return (
    <div className="divider-strip" aria-label="About SolarCredit" role="marquee">
      <div className="divider-strip__band">
        <div className="marquee-track">
          {row("a")}
          {row("b")}
        </div>
      </div>
    </div>
  );
}

export function LandingBody() {
  return (
    <>
<header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div className="h-16 w-full max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md"><div className="flex items-center gap-space-sm"><img src="/logo.png" alt="SolarCredit Logo" className="w-11 h-11 rounded-xl object-cover shadow-[0_10px_25px_-5px_rgba(0,105,72,0.25)]" /><div className="flex flex-col"><span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">SolarCredit</span><span className="font-label-sm text-label-sm text-primary font-semibold leading-tight">Clean Energy Asset</span></div></div><div className="hidden md:flex items-center gap-space-lg"><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2" data-scroll="why" href="#why">The Problem</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2" data-scroll="who" href="#who">Who It's For</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2" data-scroll="how-it-works" href="#how-it-works">How It Works</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2" data-scroll="features" href="#features">Features</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2" data-scroll="faq" href="#faq">FAQ</a></div><div className="flex items-center gap-space-sm"><a className="min-h-[44px] px-space-md py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all flex items-center gap-space-xs shadow-[0_10px_25px_-5px_rgba(0,105,72,0.2)]" data-path="onboarding-flow" href="#"><span className="hidden sm:inline">Get Started</span><span className="material-symbols-outlined text-[18px]">bolt</span></a></div></div></header><main className="flex flex-col relative w-full pt-16 pb-24 md:pb-12 bg-surface min-h-screen"><div className="flex flex-col w-full">
<section className="snap-section hero-section w-full px-margin md:px-margin-tablet lg:px-margin-desktop">
<div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center">
<div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-secondary-container/30 text-on-secondary-container shadow-sm mb-space-md">
<span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
<span className="font-label-sm text-label-sm font-semibold tracking-wide">Built for India • Policy-aware • Transparent credits</span>
</div>
<h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface max-w-3xl leading-tight tracking-tight mb-space-sm">
        Turn Your Solar Power into <span className="text-primary underline decoration-secondary-container decoration-4 underline-offset-4">Real Value.</span>
</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto mb-space-lg leading-relaxed">
        Track surplus energy, earn immutable solar credits, and use them to offset monthly power bills or trade cleanly with neighborhood microgrids.
      </p>
<div className="flex flex-col sm:flex-row items-center justify-center gap-space-sm w-full sm:w-auto">
<a className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-xs shadow-md active:scale-95 transition-all" data-scroll="how-it-works" href="#how-it-works">
<span>See How It Works</span>
<span className="material-symbols-outlined text-[18px]">arrow_downward</span>
</a>
<button className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md flex items-center justify-center gap-space-xs shadow-sm hover:shadow-md active:scale-95 transition-all" id="toggleGetStartedModal">
<span>Get Started</span>
<span className="material-symbols-outlined text-[18px]">bolt</span>
</button>
</div>
</div>
</section>
<DividerStrip />
<section className="snap-section snap-top w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl" id="why">
<div className="w-full max-w-7xl mx-auto flex flex-col">
<div className="reveal text-center max-w-3xl mx-auto mb-14">
<span className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold inline-block mb-space-xs">The Clean Energy Paradox</span>
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Why Most Rooftop Solar Goes Unrewarded</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">Millions of residential rooftops push surplus clean power to public grids, but producers receive delayed settlements, complex paper trails, or no tangible recognition.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
<div className="reveal reveal-0 flex flex-col items-center text-center">
<div className="w-14 h-14 rounded-2xl bg-error-container/40 text-error flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[30px]">hourglass_disabled</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Delayed DISCOM Net Metering</h3>
</div>
<div className="reveal reveal-1 flex flex-col items-center text-center">
<div className="w-14 h-14 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[30px]">cloud_off</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Zero Environmental Liquidity</h3>
</div>
<div className="reveal reveal-2 flex flex-col items-center text-center">
<div className="w-14 h-14 rounded-2xl bg-tertiary-fixed-dim/40 text-on-tertiary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[30px]">apartment</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Apartment Dwellers Left Out</h3>
</div>
</div>
</div>
</section>
<section className="snap-section w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl bg-surface-container-low" id="who">
<div className="w-full max-w-7xl mx-auto flex flex-col">
<div className="reveal text-center max-w-2xl mx-auto mb-space-lg">
<span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold inline-block mb-space-xs">Ecosystem Dual-Track</span>
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Built for Both Sides of the Grid</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">Whether you harvest sunlight on your terrace or consume power from a high-rise balcony, SolarCredit bridges the gap.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="reveal reveal-0 lift group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors font-label-sm text-label-sm font-bold uppercase tracking-wider">For Producers</span>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[28px]">solar_power</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">I Have Solar Panels Installed</h3>
<ul className="space-y-space-sm mb-space-lg">
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Turn surplus solar units into credits.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">See exactly how your credits are calculated.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">No new hardware needed.</span>
</li>
</ul>
</div>
<button type="button" data-path="role-producer" className="w-full py-3.5 rounded-xl bg-surface-container-high text-primary group-hover:bg-primary group-hover:text-on-primary hover:bg-primary-container transition-colors font-label-md text-label-md flex items-center justify-center gap-space-xs active:scale-95 cursor-pointer">
<span>I Generate Solar</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
<div className="reveal reveal-1 lift group bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors font-label-sm text-label-sm font-bold uppercase tracking-wider">For Consumers</span>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[28px]">electric_bolt</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">I Rent or Have No Rooftop</h3>
<ul className="space-y-space-sm mb-space-lg">
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Buy clean energy from nearby producers.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Use credits to cut your electricity bill.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">No rooftop or installation needed.</span>
</li>
</ul>
</div>
<button type="button" data-path="role-consumer" className="w-full py-3.5 rounded-xl bg-surface-container-high text-primary group-hover:bg-primary group-hover:text-on-primary hover:bg-primary-container transition-colors font-label-md text-label-md flex items-center justify-center gap-space-xs active:scale-95 cursor-pointer">
<span>I Want Clean Energy</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</section>
<section className="snap-section w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl" id="how-it-works">
<div className="w-full max-w-7xl mx-auto flex flex-col">
<div className="reveal text-center max-w-2xl mx-auto mb-space-xl">
<span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold inline-block mb-space-xs">Frictionless Lifecycle</span>
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">How SolarCredit Works in 4 Steps</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">Transparent, automated conversion from sunlight hitting the panel to financial utility in your wallet.</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
<div className="reveal reveal-0 lift bg-surface-container-lowest p-space-md md:p-space-lg rounded-2xl shadow-sm">
<div className="flex items-center justify-between mb-space-md">
<span className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center font-label-md text-label-md">1</span>
<span className="material-symbols-outlined text-primary text-[28px]">sensors</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Track Generation</h3>
</div>
<div className="reveal reveal-1 lift bg-surface-container-lowest p-space-md md:p-space-lg rounded-2xl shadow-sm">
<div className="flex items-center justify-between mb-space-md">
<span className="w-9 h-9 rounded-full bg-secondary text-on-secondary font-bold flex items-center justify-center font-label-md text-label-md">2</span>
<span className="material-symbols-outlined text-secondary text-[28px]">published_with_changes</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Convert to Credits</h3>
</div>
<div className="reveal reveal-2 lift bg-surface-container-lowest p-space-md md:p-space-lg rounded-2xl shadow-sm">
<div className="flex items-center justify-between mb-space-md">
<span className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center font-label-md text-label-md">3</span>
<span className="material-symbols-outlined text-primary-container text-[28px]">payments</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Use or Trade</h3>
</div>
<div className="reveal reveal-3 lift bg-surface-container-lowest p-space-md md:p-space-lg rounded-2xl shadow-sm">
<div className="flex items-center justify-between mb-space-md">
<span className="w-9 h-9 rounded-full bg-tertiary-container text-on-tertiary-container font-bold flex items-center justify-center font-label-md text-label-md">4</span>
<span className="material-symbols-outlined text-tertiary-container text-[28px]">forest</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Quantify Impact</h3>
</div>
</div>
</div>
</section>
<section className="snap-section w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl bg-surface-container-low" id="features">
<div className="w-full max-w-7xl mx-auto flex flex-col">
<div className="reveal max-w-3xl mb-space-lg">
<span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold inline-block mb-space-xs">Thoughtful Engineering</span>
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Key Platform Features</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Practical utilities designed around actual regulatory compliance and prosumer convenience.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
<div className="reveal reveal-0 lift bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[28px]">workspace_premium</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Verified Solar Credits</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
              No greenwashing and no inflated sustainability claims. Each credit is cryptographically mapped to verified bi-directional grid export logs verified against regional state electricity boards.
            </p>
</div>
<div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
<span className="material-symbols-outlined text-primary text-[24px]">verified</span>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm font-semibold text-on-surface">Double-Spend Prevention Ledger</span>
</div>
</div>
</div>
<div className="reveal reveal-1 lift bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[28px]">receipt_long</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Bill Payment Integration</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
              Credits don't sit trapped in an abstract digital account. Redeem directly onto your utility consumer ID to knock hundreds off your actual electricity invoice at the end of the month.
            </p>
</div>
</div>
<div className="reveal reveal-2 lift bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col">
<div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[28px]">storefront</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Credits Marketplace Trading</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">List your credits at your own price, or buy from nearby producers. Cancel a listing any time and your unsold credits come back to you.</p>
</div>
<div className="reveal reveal-0 lift bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col">
<div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[28px]">bolt</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Log &amp; Claim Your Energy</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Record your surplus units from your meter, then claim them as credits when you are ready. 1 unit becomes 1 SolarCredit.</p>
</div>
<div className="reveal reveal-1 lift bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col">
<div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[28px]">verified_user</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">On-Chain Proof</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Every credit, listing, trade and bill payment is recorded on the blockchain, so you can check any transaction yourself.</p>
</div>
<div className="reveal reveal-2 lift bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col">
<div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[28px]">dashboard</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Separate Producer &amp; Consumer Views</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Producers see their generation, credits and listings. Consumers see their credits and bills. Each role gets a simple view built for it.</p>
</div>
</div>
</div>
</section>
<section className="snap-section w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
<div className="reveal w-full max-w-7xl mx-auto bg-primary text-on-primary rounded-3xl p-space-lg md:p-space-2xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-space-lg relative overflow-hidden">
<div className="glow-breathe absolute -right-16 -bottom-16 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="max-w-2xl text-left z-10">
<span className="px-3.5 py-1 rounded-full bg-on-primary/10 text-primary-fixed font-label-sm text-label-sm font-semibold inline-block mb-space-sm">Start in under 3 minutes</span>
<h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold leading-tight mb-space-sm">
          Ready to Make Every Ray of Sunlight Count?
        </h2>
<p className="font-body-md text-body-md text-primary-fixed leading-relaxed">
          No credit card needed. Link your consumer account or rooftop generation logs to immediately inspect your pending credit reserves.
        </p>
</div>
<div className="w-full lg:w-auto flex flex-col sm:flex-row gap-space-sm z-10">
<button type="button" data-path="onboarding-flow" className="px-8 py-4 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold hover:shadow-lg active:scale-95 transition-all text-center">
          Get Started Now
        </button>
<button type="button" data-path="credit-marketplace" className="px-8 py-4 rounded-full bg-on-primary/10 text-on-primary font-label-md text-label-md font-medium hover:bg-on-primary/20 active:scale-95 transition-all text-center">
          Explore Public Marketplace
        </button>
</div>
</div>
</section>
<section className="snap-section w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl bg-surface-container-low" id="faq">
<div className="w-full max-w-4xl mx-auto flex flex-col">
<div className="reveal text-center mb-space-lg">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Frequently Asked Questions</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Clear answers to your energy and accounting inquiries.</p>
</div>
<div className="space-y-space-sm">
<details className="reveal reveal-0 group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow">
<summary className="flex cursor-pointer list-none items-center justify-between gap-space-md p-space-md [&::-webkit-details-marker]:hidden">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Does this interfere with my official DISCOM net-meter contract?</h3>
<span className="material-symbols-outlined shrink-0 text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
</summary>
<p className="px-space-md pb-space-md font-body-sm text-body-sm text-on-surface-variant">Not at all. SolarCredit operates as a supplementary accounting and peer validation platform. It layers cleanly on top of state net metering guidelines without modifying your grid connection agreement.</p>
</details>
<details className="reveal reveal-1 group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow">
<summary className="flex cursor-pointer list-none items-center justify-between gap-space-md p-space-md [&::-webkit-details-marker]:hidden">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">What hardware do I need to buy to join?</h3>
<span className="material-symbols-outlined shrink-0 text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
</summary>
<p className="px-space-md pb-space-md font-body-sm text-body-sm text-on-surface-variant">Zero hardware is required. You can connect through cloud integrations supported by leading solar inverters, or simply snap and upload monthly bi-directional electricity bills.</p>
</details>
<details className="reveal reveal-2 group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow">
<summary className="flex cursor-pointer list-none items-center justify-between gap-space-md p-space-md [&::-webkit-details-marker]:hidden">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">How do credits translate into actual rupee bill savings?</h3>
<span className="material-symbols-outlined shrink-0 text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
</summary>
<p className="px-space-md pb-space-md font-body-sm text-body-sm text-on-surface-variant">Credits are backed by registered buyers in our micro-market and can be applied toward BBPS utility payments at guaranteed clearance rates based on local power tariffs.</p>
</details>
</div>
</div>
</section>
</div></main><nav className="fixed bottom-0 w-full z-50 pb-safe md:hidden bg-surface/85 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)]"><div className="flex items-center justify-around h-16 w-full px-space-xs"><a className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors gap-0.5 text-on-surface-variant" data-scroll="top" href="#top"><span className="material-symbols-outlined text-[22px]">eco</span><span className="font-label-sm text-label-sm text-[11px] leading-none">Home</span></a><a className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors gap-0.5 text-on-surface-variant" data-scroll="how-it-works" href="#how-it-works"><span className="material-symbols-outlined text-[22px]">published_with_changes</span><span className="font-label-sm text-label-sm text-[11px] leading-none">How</span></a><a className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors gap-0.5 text-on-surface-variant" data-scroll="features" href="#features"><span className="material-symbols-outlined text-[22px]">workspace_premium</span><span className="font-label-sm text-label-sm text-[11px] leading-none">Features</span></a><a className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors gap-0.5 text-on-surface-variant" data-scroll="faq" href="#faq"><span className="material-symbols-outlined text-[22px]">help</span><span className="font-label-sm text-label-sm text-[11px] leading-none">FAQ</span></a></div></nav>
    </>
  );
}
