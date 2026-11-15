// Human-readable ABI of contracts/contracts/SolarCredit.sol (events + the calls the app makes).
export const EVENTS_ABI = [
  "event CreditsMinted(address indexed to, uint256 units, bytes32 ref, uint256 timestamp)",
  "event CreditsBurned(address indexed from, uint256 units, bytes32 ref, uint256 timestamp)",
  "event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 units, uint256 pricePerCredit, bytes32 ref)",
  "event ListingCancelled(uint256 indexed listingId, bytes32 ref)",
  "event TradeExecuted(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 units, uint256 pricePerCredit, uint256 totalPaise, bytes32 ref, uint256 timestamp)",
];

export const FULL_ABI = [
  ...EVENTS_ABI,
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function totalBurned() view returns (uint256)",
  "function totalEscrowed() view returns (uint256)",
  "function mintCredits(address to, uint256 units, bytes32 ref)",
  "function burnCredits(address from, uint256 units, bytes32 ref)",
  "function createListing(address seller, uint256 units, uint256 pricePerCredit, bytes32 ref) returns (uint256)",
  "function cancelListing(uint256 listingId, bytes32 ref)",
  "function executeTrade(uint256 listingId, address buyer, bytes32 ref)",
];
