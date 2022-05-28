import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("buyItem721", "Buy nft")
  .addParam("id", "Metadata URI")
  .addParam("price", "NFT price")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const erc20 = await hre.ethers.getContractAt("ERC20", process.env.ERC20 as string, signer);
    const marketplace = await hre.ethers.getContractAt("MarketPlaceMain", process.env.MARKETPLACE as string, signer);
    const mp721 = await hre.ethers.getContractAt("MarketPlace721", process.env.MP721 as string, signer);
    
    const proxy = mp721.attach(marketplace.address);
    await erc20.approve(marketplace.address, taskArgs.price);
    await proxy.buyItem(taskArgs.id).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});