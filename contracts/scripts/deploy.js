const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  if (hre.network.name === "sepolia") {
    const missing = ["SEPOLIA_RPC_URL", "DEPLOYER_PRIVATE_KEY"].filter((v) => !process.env[v]);
    if (missing.length) throw new Error(`Missing environment variable(s): ${missing.join(", ")}. Export them in THIS terminal tab, then run again.`);
    if (!/^0x[0-9a-fA-F]{64}$/.test(process.env.DEPLOYER_PRIVATE_KEY)) throw new Error("DEPLOYER_PRIVATE_KEY must be 0x followed by 64 hex characters.");
  }
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer wallet:        ", deployer.address);
  console.log("Deployer balance (ETH): ", hre.ethers.formatEther(balance));
  if (balance === 0n) throw new Error("This wallet has 0 ETH on this network. Get Sepolia test ETH from a faucet first.");
  const Factory = await hre.ethers.getContractFactory("SolarCredit");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const tx = contract.deploymentTransaction();

  console.log("SolarCredit deployed to:", address);
  console.log("Network:                ", hre.network.name);
  console.log("Owner (backend signer): ", deployer.address);
  console.log("Deployment tx:          ", tx.hash);

  // The Supabase edge function needs the ABI + address; the web app needs the address.
  const artifact = await hre.artifacts.readArtifact("SolarCredit");
  const out = { address, network: hre.network.name, deployTx: tx.hash, owner: deployer.address, abi: artifact.abi };
  fs.writeFileSync(path.join(__dirname, "..", "deployment.json"), JSON.stringify(out, null, 2));
  fs.writeFileSync(
    path.join(__dirname, "..", "..", "supabase", "functions", "chain-sync", "abi.json"),
    JSON.stringify(artifact.abi),
  );
  console.log("Wrote contracts/deployment.json and the edge function abi.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
