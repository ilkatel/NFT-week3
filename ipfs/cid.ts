import { IPFS } from "./ipfs";

const ipfs = new IPFS();

async function getCid () {
    console.log(await ipfs.add("C:/Users/Acer/Desktop/_Crypton/week3/ipfs/not_black.json"))
}

getCid();