import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("makeBid1155", "Make bid")
  .addParam("index", "Auction index")
  .addParam("price", "Bid price")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy1155(hre);
    await proxy.finishAuction(process.env.MP1155 as string, taskArgs.index, taskArgs.price).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});