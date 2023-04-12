const hre = require("hardhat");

// gives the balance of given address

async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// logs ether balance for list of address

async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// logs the memos stored on-chain from coffee purchases

async function main() {
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buymeacoffee = await BuyMeACoffee.deploy();

  await buymeacoffee.deployed();
  console.log("BuyMeACoffee deployed to: ", buymeacoffee.address);

  //checking balance before purchase

  const addresses = [
    owner.address,
    tipper.address,
    tipper2.address,
    tipper3.address,
  ];
  console.log("== start ==");
  await printBalances(addresses);

  // buying the owner coffee

  const tip = { value: hre.ethers.utils.parseEther("1") };
  await buymeacoffee
    .connect(tipper)
    .buyCoffee("Ratneesh", "You're the best!", tip);
  await buymeacoffee.connect(tipper2).buyCoffee("Satyam", "Amazing man!", tip);
  await buymeacoffee
    .connect(tipper3)
    .buyCoffee("Tulli", "Marvellous buddy!", tip);

  // checking balance after purchase

  console.log("== bought coffee ==");
  await printBalances(addresses);

  //withdraw

  await buymeacoffee.connect(owner).withdrawTips();

  //checking balance after withdrawl

  console.log("== withdrawTips ==");
  await printBalances(addresses);

  // checking out memos

  console.log("== memos ==");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);

  // handling errors

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
