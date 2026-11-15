const { expect } = require("chai");
const { ethers } = require("hardhat");

const REF = ethers.id("db-row-1"); // stands in for the database row id

describe("SolarCredit", function () {
  let c, owner, seller, buyer, stranger;

  beforeEach(async () => {
    [owner, seller, buyer, stranger] = await ethers.getSigners();
    c = await (await ethers.getContractFactory("SolarCredit")).deploy();
  });

  it("mints credits to a producer and tracks the total", async () => {
    await expect(c.mintCredits(seller.address, 5000, REF)).to.emit(c, "CreditsMinted");
    expect(await c.balanceOf(seller.address)).to.equal(5000);
    expect(await c.totalMinted()).to.equal(5000);
  });

  it("only the owner can write", async () => {
    await expect(c.connect(stranger).mintCredits(seller.address, 5, REF)).to.be.revertedWith("Not authorized");
    await expect(c.connect(stranger).burnCredits(seller.address, 5, REF)).to.be.revertedWith("Not authorized");
  });

  it("escrows credits when listing and rejects over-listing", async () => {
    await c.mintCredits(seller.address, 5000, REF);
    await c.createListing(seller.address, 2000, 650, REF);
    expect(await c.balanceOf(seller.address)).to.equal(3000);
    expect(await c.totalEscrowed()).to.equal(2000);
    await expect(c.createListing(seller.address, 9999, 650, REF)).to.be.revertedWith("Insufficient credits");
  });

  it("executes a trade, emits TradeExecuted and clears escrow", async () => {
    await c.mintCredits(seller.address, 5000, REF);
    await c.createListing(seller.address, 2000, 650, REF);
    // 20.00 credits at INR 6.50 = INR 130.00 = 13000 paise
    await expect(c.executeTrade(1, buyer.address, REF))
      .to.emit(c, "TradeExecuted")
      .withArgs(1, seller.address, buyer.address, 2000, 650, 13000, REF, (v) => v > 0);
    expect(await c.balanceOf(buyer.address)).to.equal(2000);
    expect(await c.totalEscrowed()).to.equal(0);
  });

  it("cannot buy twice or buy your own listing", async () => {
    await c.mintCredits(seller.address, 5000, REF);
    await c.createListing(seller.address, 2000, 650, REF);
    await expect(c.executeTrade(1, seller.address, REF)).to.be.revertedWith("Invalid buyer");
    await c.executeTrade(1, buyer.address, REF);
    await expect(c.executeTrade(1, buyer.address, REF)).to.be.revertedWith("Listing not active");
  });

  it("cancel returns escrowed credits to the seller", async () => {
    await c.mintCredits(seller.address, 5000, REF);
    await c.createListing(seller.address, 2000, 650, REF);
    await c.cancelListing(1, REF);
    expect(await c.balanceOf(seller.address)).to.equal(5000);
    expect(await c.totalEscrowed()).to.equal(0);
    await expect(c.cancelListing(1, REF)).to.be.revertedWith("Listing not active");
  });

  it("burns credits on redemption and refuses to burn more than the balance", async () => {
    await c.mintCredits(buyer.address, 1000, REF);
    await expect(c.burnCredits(buyer.address, 400, REF)).to.emit(c, "CreditsBurned");
    expect(await c.balanceOf(buyer.address)).to.equal(600);
    expect(await c.totalBurned()).to.equal(400);
    await expect(c.burnCredits(buyer.address, 601, REF)).to.be.revertedWith("Insufficient credits");
  });

  it("supply invariant: minted - burned = balances + escrow", async () => {
    await c.mintCredits(seller.address, 5000, REF);
    await c.createListing(seller.address, 2000, 650, REF);
    await c.executeTrade(1, buyer.address, REF);
    await c.burnCredits(buyer.address, 500, REF);
    const held = (await c.balanceOf(seller.address)) + (await c.balanceOf(buyer.address)) + (await c.totalEscrowed());
    expect((await c.totalMinted()) - (await c.totalBurned())).to.equal(held);
  });
});
