import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("cancel1155", "Calcel listing nft")
  .addParam("index", "Sale Id")
  .addParam("amount", "NFTS amount")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy1155(hre);
    await proxy.cancel(taskArgs.index, taskArgs.amount).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});