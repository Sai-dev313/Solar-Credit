require("@nomicfoundation/hardhat-toolbox");

// Secrets come from the environment, never from the repo.
//   SEPOLIA_RPC_URL     e.g. https://sepolia.infura.io/v3/<key>  (or Alchemy)
//   DEPLOYER_PRIVATE_KEY  a throwaway wallet funded from a Sepolia faucet
const { SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    // Always defined so a missing variable gives a clear message in scripts/deploy.js, not HH100.
    sepolia: { url: SEPOLIA_RPC_URL || "http://127.0.0.1:1", accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [] },
  },
};
