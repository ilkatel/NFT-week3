import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("cancel721", "Calcel listing nft")
  .addParam("id", "Token Id")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy721(hre);
    await proxy.cancel(taskArgs.id).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});