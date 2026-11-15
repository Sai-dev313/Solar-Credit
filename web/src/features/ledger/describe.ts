import type { ChainEvent } from "../../data";
import { credits, inr } from "../../lib/format";

/** One plain-English line per blockchain record, from the viewer's point of view. */
export function describeEvent(e: ChainEvent, me: string): string {
  const c = credits(e.payload.credits ?? 0);
  switch (e.kind) {
    case "MINT": return `Converted ${c} credits from exported energy`;
    case "LIST": return `Listed ${c} credits at ${inr(e.payload.price ?? 0)} each`;
    case "CANCEL": return `Cancelled a listing, ${c} credits returned`;
    case "BURN": return `Redeemed ${c} credits on an electricity bill (saved ${inr(e.payload.savings ?? 0)})`;
    case "TRADE": return e.user_id === me
      ? `Bought ${c} credits for ${inr(e.payload.total ?? 0)}`
      : `Sold ${c} credits for ${inr(e.payload.total ?? 0)}`;
  }
}
