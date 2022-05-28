import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("finish721", "Finish auction")
  .addParam("id", "Token Id")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy721(hre);
    await proxy.finishAuction(process.env.MP721 as string, taskArgs.id).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});