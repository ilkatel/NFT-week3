import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

export default task("listItem1155", "List nft")
  .addParam("id", "Token Id")
  .addParam("amount", "Tokens amount")
  .addParam("price", "Token price")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy1155(hre);
    await proxy.listItem(taskArgs.id, taskArgs.amount, taskArgs.price).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});