import * as dotenv from "dotenv";

import { task } from "hardhat/config";
import { ContractTransaction as tx } from "ethers";
import { utils } from "./utils";

dotenv.config();

const u = new utils;

// https://ipfs.io/ipfs/QmcRFEBJ9Z2PeChgSUqATGdTSihfVWMSQ89Kboi5B3xPUT/Users/Acer/Desktop/_Crypton/week3/ipfs/not_black.json
export default task("createItem1155", "Create nft")
  .addParam("uri", "Metadata URI")
  .addParam("amount", "NFTS amount")
  .setAction(async (taskArgs, hre) => {
    const proxy = await u.proxy1155(hre);
    await proxy.createItem(taskArgs.amount, taskArgs.uri).then((result: tx) => console.log(`tx hash: ${result.hash}`));
});