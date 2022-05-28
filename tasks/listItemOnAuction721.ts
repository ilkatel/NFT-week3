import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("listAuction721", "List item on auction")
  .addParam("id", "Token Id")
  .addParam("begin", "Start price")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy721(hre);
    await proxy.listAuction(taskArgs.id, taskArgs.begin).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});