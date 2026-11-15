// Row mappers shared by both backends: numeric columns arrive as strings or bigints
// depending on the driver, dates as Date objects or strings.
import type { BillPayment, ChainEvent, EnergyLog, MarketListing, MyListing, Profile, Trade } from "./types";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const n = (v: unknown) => Number(v);
const ts = (v: unknown) => (v instanceof Date ? v.toISOString() : v == null ? "" : String(v));
const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));

export const mapProfile = (r: Row): Profile => ({
  id: r.id, full_name: r.full_name, role: r.role, credits: n(r.credits), cash: n(r.cash), wallet_address: r.wallet_address ?? null,
});
export const mapLog = (r: Row): EnergyLog => ({
  id: r.id, log_date: day(r.log_date), generated: n(r.generated), used: n(r.used), exported: n(r.exported), claimed: n(r.claimed),
});
export const mapMyListing = (r: Row): MyListing => ({
  id: r.id, credits: n(r.credits), price_per_credit: n(r.price_per_credit), status: r.status, created_at: ts(r.created_at),
});
export const mapMarket = (r: Row): MarketListing => ({
  id: r.id, credits: n(r.credits), price_per_credit: n(r.price_per_credit), total: n(r.total),
  seller_name: r.seller_name, is_mine: !!r.is_mine, created_at: ts(r.created_at),
});
export const mapTrade = (r: Row): Trade => ({
  id: r.id, listing_id: r.listing_id, buyer_id: r.buyer_id, seller_id: r.seller_id,
  credits: n(r.credits), total_price: n(r.total_price), created_at: ts(r.created_at),
});
export const mapBill = (r: Row): BillPayment => ({
  id: r.id, provider: r.provider, consumer_number: r.consumer_number, consumer_name: r.consumer_name,
  billing_month: r.billing_month, meter_number: r.meter_number, units_consumed: n(r.units_consumed),
  rate_per_unit: n(r.rate_per_unit), bill_amount: n(r.bill_amount), credits_used: n(r.credits_used),
  credit_savings: n(r.credit_savings), upi_paid: n(r.upi_paid), created_at: ts(r.created_at),
});
export const mapEvent = (r: Row): ChainEvent => ({
  id: n(r.id), kind: r.kind, status: r.status, user_id: r.user_id, counterparty_id: r.counterparty_id ?? null,
  ref_id: r.ref_id, payload: r.payload ?? {}, tx_hash: r.tx_hash ?? null,
  block_number: r.block_number == null ? null : n(r.block_number), attempts: n(r.attempts),
  last_error: r.last_error ?? null, created_at: ts(r.created_at), confirmed_at: r.confirmed_at ? ts(r.confirmed_at) : null,
});
