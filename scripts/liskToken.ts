import { ethers } from "hardhat";

async function toks() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const LiskToken = await ethers.getContractFactory("LiskToken");
  const liskToken = await LiskToken.deploy(1000); 
  console.log("Target set to:", liskToken.target);

      // Target set to: 0xE1C88c179302863f686C4Dc69302f8e6372cD90c


}

toks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });