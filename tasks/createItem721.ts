import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

// https://ipfs.io/ipfs/QmfCECP4dpA9YujBFfX7EkXNiesQvYo31k6ZYJkfayzGTY/Users/Acer/Desktop/_Crypton/week3/ipfs/black.json
export default task("createItem721", "Create nft")
  .addParam("uri", "Metadata URI")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy721(hre);
    await proxy.createItem(taskArgs.uri).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});
