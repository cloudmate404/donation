const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { METADATA_URL } = require("../constants");

async function main() {
  const metadataURL = METADATA_URL;

  const donationContract = await ethers.getContractFactory("Donation");

  const deployedDonationContract = await donationContract.deploy(metadataURL);

  await deployedDonationContract.deployed();

  console.log("Donation Contract Address:", deployedDonationContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Donation Contract Address: 0x28c0e393DB6cD08D9e665d4c4bF094c6Fed88fef
