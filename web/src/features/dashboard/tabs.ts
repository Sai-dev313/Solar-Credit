import type { Role } from "../../data";

/** The dashboard features. The sidebar lists them; /app?tab=<id> shows the matching panel. */
export interface DashTab { id: string; label: string; icon: string }

export const PRODUCER_TABS: DashTab[] = [
  { id: "log-energy", label: "Log Energy", icon: "sun-dim" },
  { id: "convert-credits", label: "Convert to Credits", icon: "arrows-clockwise" },
  { id: "marketplace", label: "Marketplace", icon: "storefront" },
  { id: "pay-bill", label: "Pay Electricity Bill", icon: "lightning" },
  { id: "payment-history", label: "Payment History", icon: "receipt" },
  { id: "ledger", label: "Blockchain Ledger", icon: "link" },
];
export const CONSUMER_TABS: DashTab[] = [
  { id: "marketplace", label: "Buy Credits", icon: "storefront" },
  { id: "pay-bill", label: "Pay Electricity Bill", icon: "lightning" },
  { id: "payment-history", label: "Payment History", icon: "receipt" },
  { id: "ledger", label: "Blockchain Ledger", icon: "link" },
];

export const tabsFor = (role: Role): DashTab[] => (role === "producer" ? PRODUCER_TABS : CONSUMER_TABS);
/** The tab that is open for a ?tab= value (falls back to the role's first tab). */
export const activeTab = (role: Role, wanted: string | null): string =>
  tabsFor(role).find((t) => t.id === wanted)?.id ?? tabsFor(role)[0].id;
