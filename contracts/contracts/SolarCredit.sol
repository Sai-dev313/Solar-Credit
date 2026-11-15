// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * SolarCredit: a public, append-only ledger for peer-to-peer solar credit trading.
 *
 * Units
 *   1 credit = 1 kWh exported to the grid.
 *   Amounts are stored in hundredths of a credit ("units"): 150 units = 1.50 credits.
 *   Prices are stored in paise per whole credit (INR 6.50 = 650).
 *
 * Trust model (custodial)
 *   The platform backend owns this contract and signs every transaction, so users
 *   need no wallet or gas. Every state change still emits an event carrying `ref`,
 *   the id of the matching row in the platform database, so anyone can audit the
 *   database against the chain.
 */
contract SolarCredit {
    address public owner;

    mapping(address => uint256) public balanceOf; // spendable units per account
    uint256 public totalMinted;
    uint256 public totalBurned;
    uint256 public totalEscrowed;

    struct Listing {
        uint256 id;
        address seller;
        uint256 units;
        uint256 pricePerCredit; // paise
        bool active;
    }

    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;

    event CreditsMinted(address indexed to, uint256 units, bytes32 ref, uint256 timestamp);
    event CreditsBurned(address indexed from, uint256 units, bytes32 ref, uint256 timestamp);
    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 units, uint256 pricePerCredit, bytes32 ref);
    event ListingCancelled(uint256 indexed listingId, bytes32 ref);
    event TradeExecuted(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 units,
        uint256 pricePerCredit,
        uint256 totalPaise,
        bytes32 ref,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// Mint credits when a producer claims energy exported to the grid.
    function mintCredits(address to, uint256 units, bytes32 ref) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(units > 0, "Units must be > 0");
        balanceOf[to] += units;
        totalMinted += units;
        emit CreditsMinted(to, units, ref, block.timestamp);
    }

    /// Burn credits when a consumer redeems them against an electricity bill.
    function burnCredits(address from, uint256 units, bytes32 ref) external onlyOwner {
        require(units > 0, "Units must be > 0");
        require(balanceOf[from] >= units, "Insufficient credits");
        balanceOf[from] -= units;
        totalBurned += units;
        emit CreditsBurned(from, units, ref, block.timestamp);
    }

    /// List credits for sale. They are held in escrow until sold or cancelled.
    function createListing(address seller, uint256 units, uint256 pricePerCredit, bytes32 ref)
        external
        onlyOwner
        returns (uint256)
    {
        require(units > 0 && pricePerCredit > 0, "Invalid amount or price");
        require(balanceOf[seller] >= units, "Insufficient credits");

        balanceOf[seller] -= units;
        totalEscrowed += units;
        listingCount += 1;
        listings[listingCount] = Listing(listingCount, seller, units, pricePerCredit, true);

        emit ListingCreated(listingCount, seller, units, pricePerCredit, ref);
        return listingCount;
    }

    /// Cancel a listing and return escrowed credits to the seller.
    function cancelListing(uint256 listingId, bytes32 ref) external onlyOwner {
        Listing storage l = listings[listingId];
        require(l.active, "Listing not active");
        l.active = false;
        totalEscrowed -= l.units;
        balanceOf[l.seller] += l.units;
        emit ListingCancelled(listingId, ref);
    }

    /// Buy a whole listing. Credits move from escrow to the buyer.
    function executeTrade(uint256 listingId, address buyer, bytes32 ref) external onlyOwner {
        Listing storage l = listings[listingId];
        require(l.active, "Listing not active");
        require(buyer != address(0) && buyer != l.seller, "Invalid buyer");

        l.active = false;
        totalEscrowed -= l.units;
        balanceOf[buyer] += l.units;

        emit TradeExecuted(
            listingId,
            l.seller,
            buyer,
            l.units,
            l.pricePerCredit,
            (l.units * l.pricePerCredit) / 100,
            ref,
            block.timestamp
        );
    }
}
