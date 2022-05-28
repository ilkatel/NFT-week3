import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("listAuction1155", "List item on auction")
  .addParam("id", "Token Id")
  .addParam("amount", "NFTS amount")
  .addParam("begin", "Start price")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy1155(hre);
    await proxy.listAuction(taskArgs.id, taskArgs.amount, taskArgs.begin).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});