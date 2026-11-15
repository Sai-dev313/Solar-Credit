export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const credits = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const shortHash = (h: string, head = 8, tail = 6) => (h.length > head + tail + 2 ? `${h.slice(0, head)}…${h.slice(-tail)}` : h);

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const dateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** "unit" for exactly 1, "units" otherwise (energy is shown in units; 1 unit = 1 kWh). */
export const unitWord = (n: number) => (n === 1 ? "unit" : "units");
/** "18 units", "1 unit", "0.5 units" */
export const units = (n: number) => `${credits(n)} ${unitWord(n)}`;
