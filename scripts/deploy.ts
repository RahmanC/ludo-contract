import { ethers } from "hardhat";

async function main() {
  // get the contract factory
  const Ludo = await ethers.getContractFactory("Ludo");

  const ludoContract = await Ludo.deploy();

  await ludoContract.waitForDeployment();

  // deployed contract address
  const deployedAddress = await ludoContract.getAddress();

  console.log("Contract deployment", ludoContract);
  console.log({ deployedAddress });
}

main().catch(() => {
  console.error("An error occurred while running the script");
  process.exit(1);
});
