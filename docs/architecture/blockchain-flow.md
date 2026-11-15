# Blockchain flow

How an action in the app ends up as a record on the public blockchain, and how anyone can check it.

Code: contract [`contracts/contracts/SolarCredit.sol`](../../contracts/contracts/SolarCredit.sol) · sender
[`supabase/functions/chain-sync/`](../../supabase/functions/chain-sync/) · address and ABI
[`contracts/deployment.json`](../../contracts/deployment.json) · what the website needs
[`docs/api/API_CONTRACT.md`](../api/API_CONTRACT.md) (sections 6 and 7).

## The flow

```
user clicks (claim / list / buy / cancel / pay bill)
   -> database function changes the data AND inserts a chain_events row   (one transaction, supabase/migrations)
   -> the website calls the edge function  chain-sync
   -> claim_chain_events() hands out up to 5 pending rows (locked, so two runs never send the same one)
   -> chain-sync sends the matching contract call, one at a time, and waits for the receipt
   -> the row is updated:  status = confirmed, tx_hash, block_number, confirmed_at
   -> the website's "Blockchain Ledger" and proof page read the chain directly and decode the event
```

The app keeps working when the chain is slow or down: the database change is already saved, and the event stays
`pending` until the next call.

## Who signs: a custodial model

The platform owns the contract and signs every transaction, so users need **no wallet and no gas**. Each user still
gets their own on-chain address, derived from `keccak256("<CHAIN_PRIVATE_KEY>:<user id>")`, and it is saved in
`profiles.wallet_address`. Every state change emits an event carrying `ref`, the database row id, so the database can
be audited against the chain.

## Database events and contract calls

| `chain_events.kind` | Contract call | Event emitted | The website calls it |
|---|---|---|---|
| `MINT` | `mintCredits(to, units, ref)` | `CreditsMinted` | "convert" |
| `LIST` | `createListing(seller, units, pricePerCredit, ref)` | `ListingCreated` (returns the on-chain listing id, saved in `listings.chain_listing_id`) | list |
| `CANCEL` | `cancelListing(listingId, ref)` | `ListingCancelled` | cancel |
| `TRADE` | `executeTrade(listingId, buyer, ref)` | `TradeExecuted` | buy |
| `BURN` | `burnCredits(from, units, ref)` | `CreditsBurned` | pay a bill with credits |

All five write functions are `onlyOwner`. **Units** are hundredths of a credit (1.50 credits = 150); **prices and totals are
in paise**; **`ref`** is the database row uuid padded to 32 bytes.

## Safety rules in chain-sync

- Events are sent strictly in id order, one at a time, with a plain `Wallet` (not `NonceManager`: a reverted call would
  burn a nonce and every later transaction would fail).
- A `CANCEL` or `TRADE` whose `LIST` is not confirmed yet is **deferred**, not lost, and so are that user's later events.
- A failed send is retried up to **5 times** (`attempts`, `last_error`), then marked `failed`.
- Rows stuck in `processing` for more than 2 minutes are picked up again.

## Settings (secrets, never in the repo)

Set with `supabase secrets set NAME=value`:

| Secret | Meaning |
|---|---|
| `CHAIN_RPC_URL` | JSON-RPC endpoint (Sepolia via Alchemy or Infura, or a local node) |
| `CHAIN_PRIVATE_KEY` | The contract owner's key, a **throwaway test wallet** only |
| `CHAIN_CONTRACT_ADDRESS` | Address printed by the deploy |

The website needs only public values: `VITE_RPC_URL`, `VITE_CONTRACT_ADDRESS`, `VITE_CHAIN_NAME`, `VITE_EXPLORER_URL`.

## Deploy and test

```
cd contracts && npm ci
npm test                          # 8 contract tests
npx hardhat node                  # local chain (separate terminal)
npm run deploy:local              # also rewrites contracts/deployment.json and the function's abi.json
cd ../supabase && npm ci && node tests/e2e.mjs      # database -> outbox -> chain-sync -> chain
```

Sepolia: export `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` (with `0x`) **in the same terminal tab**, then
`npm run deploy:sepolia`. Then set the three secrets above, set `VITE_CONTRACT_ADDRESS` in the website's hosting, and
deploy the function (`supabase functions deploy chain-sync`). CI (`contracts.yml`) runs the contract tests and the
end-to-end test on every pull request.

## Known limits

- Running `deploy:local` overwrites `contracts/deployment.json` (the committed Sepolia record) and the function's
  `abi.json`; restore them from git before committing.
- There is no Etherscan verification script yet.
- User addresses are derived from the owner key, so **changing `CHAIN_PRIVATE_KEY` changes every user's address**.
