import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying Timelock contract with the account:", deployer.address);

    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy("0xE1C88c179302863f686C4Dc69302f8e6372cD90c");
     // Deploy the contract 

    console.log("Target set to:", timelock.target);

    // Target set to: 0xfFAD5DeBaCe9D820D9C7A9909bdE43EBcD4ABfe8
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
