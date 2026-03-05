const hre = require("hardhat");

async function main() {
  const CubeArena = await hre.ethers.getContractFactory("CubeArena");
  const game = await CubeArena.deploy();
  await game.waitForDeployment();

  const address = await game.getAddress();
  console.log("CubeArena deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
