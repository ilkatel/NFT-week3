import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("finish1155", "Finish auction")
  .addParam("index", "Auction index")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy1155(hre);
    await proxy.finishAuction(process.env.MP1155 as string, taskArgs.index).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});